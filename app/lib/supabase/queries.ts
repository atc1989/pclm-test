
import { createClient } from "./client";
import { Database } from "./types";

// Doctor operations
export async function getDoctorProfile(doctorId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", doctorId)
    .eq("role", "doctor")
    .single();

  if (error) {
    console.error("Error fetching doctor profile:", error);
    return null;
  }

  return data;
}

export async function getDoctorClinic(doctorId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("doctor_clinics")
    .select("*")
    .eq("doctor_id", doctorId)
    .single();

  if (error) {
    console.error("Error fetching doctor clinic:", error);
    return null;
  }

  return data;
}

export async function getDoctorVerification(doctorId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("doctor_verifications")
    .select("*")
    .eq("doctor_id", doctorId)
    .single();

  if (error) {
    console.error("Error fetching doctor verification:", error);
    return null;
  }

  return data;
}

export async function getDoctorOnboardingStatus(doctorId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("onboarding_status")
    .select("*")
    .eq("doctor_id", doctorId)
    .single();

  if (error) {
    console.error("Error fetching onboarding status:", error);
    return null;
  }

  return data;
}

export async function updateDoctorClinic(
  doctorId: string,
  updates: Partial<Database["public"]["Tables"]["doctor_clinics"]["Update"]>
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("doctor_clinics")
    .update(updates)
    .eq("doctor_id", doctorId)
    .select()
    .single();

  if (error) {
    console.error("Error updating doctor clinic:", error);
    throw error;
  }

  return data;
}

export async function updateDoctorVerification(
  doctorId: string,
  updates: Partial<Database["public"]["Tables"]["doctor_verifications"]["Update"]>
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("doctor_verifications")
    .update(updates)
    .eq("doctor_id", doctorId)
    .select()
    .single();

  if (error) {
    console.error("Error updating doctor verification:", error);
    throw error;
  }

  return data;
}

export async function updateOnboardingStatus(
  doctorId: string,
  status: Database["public"]["Enums"]["onboarding_state"]
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("onboarding_status")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("doctor_id", doctorId)
    .select()
    .single();

  if (error) {
    console.error("Error updating onboarding status:", error);
    throw error;
  }

  return data;
}

// Patient operations
export async function getPatientProfile(patientId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("patient_profiles")
    .select("*")
    .eq("id", patientId)
    .single();

  if (error) {
    console.error("Error fetching patient profile:", error);
    return null;
  }

  return data;
}

export async function updatePatientProfile(
  patientId: string,
  updates: Partial<Database["public"]["Tables"]["patient_profiles"]["Update"]>
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("patient_profiles")
    .update(updates)
    .eq("id", patientId)
    .select()
    .single();

  if (error) {
    console.error("Error updating patient profile:", error);
    throw error;
  }

  return data;
}

// Lab results operations
export async function getPatientLabResults(patientId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lab_results")
    .select("*")
    .eq("patient_id", patientId)
    .order("test_date", { ascending: false });

  if (error) {
    console.error("Error fetching lab results:", error);
    return [];
  }

  return data;
}

export async function createLabResult(
  result: Database["public"]["Tables"]["lab_results"]["Insert"]
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lab_results")
    .insert(result)
    .select()
    .single();

  if (error) {
    console.error("Error creating lab result:", error);
    throw error;
  }

  return data;
}

// Bioscan reviews operations
export async function getDoctorBioscanReviews(doctorId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bioscan_reviews")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bioscan reviews:", error);
    return [];
  }

  return data;
}

export async function updateBioscanReview(
  reviewId: string,
  updates: Partial<Database["public"]["Tables"]["bioscan_reviews"]["Update"]>
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bioscan_reviews")
    .update(updates)
    .eq("id", reviewId)
    .select()
    .single();

  if (error) {
    console.error("Error updating bioscan review:", error);
    throw error;
  }

  return data;
}
