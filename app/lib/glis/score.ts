export type Markers = {
  crp: number | null;
  wbc: number | null;
  neut: number | null;
  lymph: number | null;
  glu: number | null;
  alt: number | null;
  trig: number | null;
  hdl: number | null;
};

export type ScoreResult = {
  score: number;
  inflDomain: number;
  metDomain: number;
  flags: string[];
  nlr: number;
  tyg: number;
  ok: boolean;
};

export type TierKey = "trial" | "start" | "grow" | "peak";

export type Tier = {
  n: string;
  f: string;
  c: number;
  b: number;
  p: number;
  w: number;
  d: number;
  scans: number;
};

export const TIERS: Record<TierKey, Tier> = {
  trial: { n: "Trial", f: "Trial Protocol", c: 10, b: 1, p: 1299, w: 1, d: 5, scans: 1 },
  start: { n: "Start", f: "Start Protocol", c: 40, b: 4, p: 4999, w: 3, d: 20, scans: 1 },
  grow: { n: "Grow", f: "Grow Protocol", c: 120, b: 12, p: 13999, w: 6, d: 40, scans: 3 },
  peak: { n: "Peak", f: "Peak Protocol", c: 400, b: 40, p: 39999, w: 13, d: 90, scans: 3 },
};

export const TIER_TIKTOK_URLS: Record<TierKey, string> = {
  trial: "https://www.tiktok.com/view/product/1733428486628607712?encode_params=MIIBpgQMh240QSbo4l4E0UZUBIIBggPdWycRJ-lMiOsgDL_rzWS2MwHb7CyDSDNcDm8-Gy8r0a0gOrDnBNq4DhKy0RI3jLq-cMBK_pcUWJ9TSa_DlSDITVwOQb5CVGNfcE0oTbjT9QUux2QCDLJjkprkxRPIga20g6RH3LqWHJMruUGjHmn_ICgjdQ9tyWrJQ3lpnCW7dqmEKxEx_H1HTl1rPYwjM-9Kch8uMpWHfa6UOhYta_dp3XoOwhaqqJsjGejOOirkCqJEIS5de4xdsAQLBAF0jMXRdKSEwJv3PbVGvpoMMjJs_--3Ce-Vm-uJm_1weugYpOwd4RfbUdAgZgWI_kW4OZTw-8bE_ZpH0_K-1VcZj_-hi4ZMX74NyD1oz1nvqo9XKdznq37WNPYca0MQ6dSi_ODSNxyDakrDAM5mnZsXKFa7QQAinLx170Ra5wpN85YZ-ewSIonNzx1lDqWbno3UbdwRArVpmYGqKwP9KG94qajUF7xKIMRrhxgwQ8ho69jGeLk959xsVqlfGXldwDQLcBsqBBBT_X6avmo-QyguJy1232VI&region=PH&locale=en&source=seller_center&hide_tips=&no-cache=1&e=1",
  start: "https://www.tiktok.com/view/product/1735690226633574112?encode_params=MIIBpgQMShJ5kwAYAJ_1hrMzBIIBgie1ranvRK2TLkQQ9Nk60h2YbvRh1_njfRYNoS23kBtdI9QHFjQQ0vKP9Tnojl1k4KsECEA8TOajc5kR9eglEXMxaKblEngsd8hzuujLSDogK-2Alvr23JrdF34bFVME6SuD3_gG-Y9xETXp0f_gA2ypWUDZZO278IHybbuWMXT9FK2mKFORiv2cTxL2bCRveAANEnFd1EmPExYiQ368MYhP2sOGHjgE9PuhAiKtOLnDfixRi9_1E6O9C1fXclci8GxhrT4kMC81YvqcGqaSWKN4LvluG1wVU-CxU5Dq2g_JOKaGfF_D5k0OtkWP8ChyGrbhpAT6ViKITEfvxSzjU7s6TgyJRaF5S3W34iMMxDiIzCF4-wpZKMIHAChlqm-9m-YDsRLTUZczfBY2YjiD-wYn4yrStp_mj_V5BOhjdcYs3NgBfpdHpL68dp3XoqrvR-yP01TLq8k-oVthiLglYQnDH7-qcDR1kMpVyuoYmMeLzakhKSkKMqpPswEsnJK2j-VaBBDFoel9LTx2BTcUN32RYIbO&region=PH&locale=en&source=seller_center&hide_tips=&no-cache=1&e=1",
  grow: "https://www.tiktok.com/view/product/1735690692352444128?encode_params=MIIBpgQM6gRwTX7tnU3CMwc5BIIBgqb9PASRMlbwByBFx8sG8dBw2qI4JtUHzC4v27UvKNIIt5hcX29oYhj9WXDDLoVLEzJymOZqqdf-jBqyrwpA44__jNCsdwbG5fwnwkn9lZuJLlC6QHWG20-g-K1vqzdi3tIlj-0joow17mXtKIcbCf-8j-zXU3m6oSwLYmTmDysDgMTCDoHLgRjwGpQSEDb2glCH8ymE2UGcXlV1Z9NHoMc5zwF-aVJ32PMNbJPRIsijOg6RjWCLcm6jIQhSVB2M28wllckPQAkdIjQti-c1tpUJLR2h-aoJur0OUfyQtWm6imnGIgPSMwrc_OEYVd9tMrCWmHSD9577s3ZBYQd6zGUznG0r73SfPPWK2gsHAg8NKtbGPtQMgIpRBN-XvIp7SyJgmtLlNQuyFZA-gmtsWIY3EoabtMFFLSDy3nTxF165C6lDAd3uUipa3RydLuyc0RUV8B5NsD1rRZC4jpGRyVtyvmf7T5II96hzuLX4FVixJaJY-Xf9JLlqECR-nyAPY3SKBBDdRBJcB0L-R7luyxaDP-LB&region=PH&locale=en&source=seller_center&hide_tips=&no-cache=1&e=1",
  peak: "https://www.tiktok.com/view/product/1735691058658576096?encode_params=MIIBpgQMrB_SQROzosUZKsuhBIIBgsyscgTJ0mPqIxhoFlw8UMkKGz1y6UVkfFJ3w0SwJWS060qNslbIkTMmYOV6RclFyisE1hhz7v6_yuRt-s__tTXYjEdpNdkMDuO2Xy0zoM2iFGcgk-KJDT49tK6xCNh6csDFn0TDgXe8LmZ4epmeus-Olo_aMA2Tul56BPGTNUoKBKSKH1CTDVQcjB9lg4_NDH6vhSb2C-WrIka66iPxhD8OpSWdn8oZqPAUJguDBSqokgELM2tcdcxtxDLtzQGih_qKOyNDNXPYPsuJn67UxIioJfrir7kpUDyezaW8RkOHDCkTyy1luQXs69B3xTkJEvQCUY8dr-7TheCudPJsF7E4BOEVg1n23-UuvQ4Rftb_S0fyPhnooDE7OAPsRZDtAx5WSigeSEwqxt1FEwy5_CtkT72nhDKnF-HxDchgG7SY2vwgQY--pYvmzI8QcRnjVVC-SOmVzM4axlhCnAnzAKKMqPmBjGwZmr6GRnVDgWrt36krNq125pvPp2G-8F85lrPuBBBdQjsJZ1xOR-oq46mDXRsR&region=PH&locale=en&source=seller_center&hide_tips=&no-cache=1&e=1",
};

export function glisScore(m: Markers): ScoreResult {
  // Inflammatory Domain (50%)
  let crpPts = 0;
  if (m.crp !== null) {
    if (m.crp >= 5) crpPts = 20;
    else if (m.crp >= 3) crpPts = 15;
    else if (m.crp >= 1) crpPts = 10;
  }

  const nlr =
    m.neut !== null && m.lymph !== null && m.lymph > 0
      ? m.neut / m.lymph
      : 0;
  let nlrPts = 0;
  if (nlr > 5) nlrPts = 20;
  else if (nlr >= 3) nlrPts = 15;
  else if (nlr >= 2) nlrPts = 8;

  const inflDomain = Math.round(((crpPts + nlrPts) / 40) * 50);

  // Metabolic Domain (50%)
  let gluPts = 0, tgPts = 0, hdlPts = 0, altPts = 0;

  if (m.glu !== null) {
    gluPts = m.glu > 125 ? 18 : m.glu >= 100 ? 12 : m.glu >= 90 ? 6 : 0;
  }
  if (m.trig !== null) {
    tgPts = m.trig > 200 ? 18 : m.trig >= 150 ? 12 : m.trig >= 100 ? 6 : 0;
  }
  if (m.hdl !== null) {
    hdlPts = m.hdl < 40 ? 12 : m.hdl < 50 ? 8 : m.hdl <= 60 ? 4 : 0;
  }
  if (m.alt !== null) {
    altPts = m.alt > 60 ? 10 : m.alt >= 40 ? 6 : m.alt >= 25 ? 3 : 0;
  }

  const tyg =
    m.trig !== null && m.glu !== null && m.trig > 0 && m.glu > 0
      ? Math.log((m.trig * m.glu) / 2)
      : 0;
  const tygPts = tyg > 9.5 ? 20 : tyg >= 9 ? 15 : tyg >= 8.5 ? 8 : 0;

  const metDomain = Math.round(((gluPts + tgPts + hdlPts + tygPts + altPts) / 78) * 50);

  const score = Math.min(100, inflDomain + metDomain);

  const flags: string[] = [];
  if (m.crp !== null && m.crp > 10) flags.push("hs-CRP >10");
  if (m.glu !== null && m.glu > 180) flags.push("Glucose >180");
  if (m.alt !== null && m.alt > 100) flags.push("ALT >100");
  if (nlr > 8) flags.push("NLR >8");

  return { score, inflDomain, metDomain, flags, nlr, tyg, ok: true };
}

export function scoreColor(score: number): string {
  if (score <= 25) return "#5CB882";
  if (score <= 50) return "#E8B230";
  if (score <= 75) return "#E8772E";
  return "#D42020";
}

export function scoreBand(score: number): string {
  if (score <= 25) return "Low";
  if (score <= 50) return "Moderate";
  if (score <= 75) return "High";
  return "Critical";
}

export function suggestTier(score: number): TierKey {
  if (score <= 25) return "trial";
  if (score <= 50) return "start";
  if (score <= 75) return "grow";
  return "peak";
}

export function scoreSummary(score: number): string {
  if (score <= 25)
    return "Your gut inflammation score is low. A short trial protocol is recommended to maintain your gut health.";
  if (score <= 50)
    return "Your score indicates moderate gut inflammation. A Start Protocol is recommended to address early markers.";
  if (score <= 75)
    return "Your score shows elevated gut inflammation. A Grow Protocol is recommended for sustained recovery.";
  return "Your score indicates critical gut inflammation. A Peak Protocol is strongly recommended for comprehensive treatment.";
}
