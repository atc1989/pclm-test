-- Backfill pending BioScan review rows for patient scans that were saved
-- through older portal paths before the PRD-aligned physician review flow
-- became the only supported submission path.

insert into public.bioscan_reviews (
  lab_result_id,
  patient_id,
  status,
  created_at
)
select
  lab_results.id,
  lab_results.patient_id,
  'pending_review'::public.bioscan_review_status,
  coalesce(inflammation_scores.created_at, lab_results.created_at)
from public.lab_results
join public.inflammation_scores
  on inflammation_scores.lab_result_id = lab_results.id
left join public.bioscan_reviews
  on bioscan_reviews.lab_result_id = lab_results.id
where bioscan_reviews.id is null
  and coalesce(inflammation_scores.physician_confirmed, false) = false;
