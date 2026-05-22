alter table public.lab_results
  add column if not exists journey_position integer,
  add column if not exists follow_up_number integer;

with ranked_scans as (
  select
    id,
    patient_id,
    stage,
    created_at,
    case
      when stage = 'baseline' then 0
      when stage = 'mid_check' then 1
      else row_number() over (
        partition by patient_id, stage
        order by created_at, id
      ) + 1
    end as computed_journey_position,
    case
      when stage = 'follow_up' then row_number() over (
        partition by patient_id, stage
        order by created_at, id
      )
      else null
    end as computed_follow_up_number
  from public.lab_results
)
update public.lab_results as target
set
  journey_position = ranked_scans.computed_journey_position,
  follow_up_number = ranked_scans.computed_follow_up_number
from ranked_scans
where ranked_scans.id = target.id
  and (
    target.journey_position is null
    or target.follow_up_number is distinct from ranked_scans.computed_follow_up_number
  );

alter table public.lab_results
  alter column journey_position set not null;

alter table public.lab_results
  alter column journey_position set default 0;

create index if not exists lab_results_patient_journey_position_idx
  on public.lab_results (patient_id, journey_position asc, created_at asc);

alter table public.protocol_checkpoints
  add column if not exists journey_position integer,
  add column if not exists follow_up_number integer;

update public.protocol_checkpoints
set
  journey_position = case
    when checkpoint_code in ('day_30', 'mid_check') then 1
    when checkpoint_code in ('day_60', 'follow_up_1') then 2
    when checkpoint_code in ('day_90', 'follow_up_2') then 3
    else coalesce(journey_position, 1)
  end,
  follow_up_number = case
    when checkpoint_code in ('day_60', 'follow_up_1') then 1
    when checkpoint_code in ('day_90', 'follow_up_2') then 2
    else follow_up_number
  end
where journey_position is null;

alter table public.protocol_checkpoints
  alter column journey_position set not null;

alter table public.protocol_checkpoints
  alter column journey_position set default 1;

create index if not exists protocol_checkpoints_plan_journey_position_idx
  on public.protocol_checkpoints (protocol_plan_id, journey_position asc);
