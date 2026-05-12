"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DoctorAuthForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [viber, setViber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!email) {
        setError("Email is required to sign in");
        setLoading(false);
        return;
      }

      // Sign in with email/password
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: phone, // Use phone as password for this flow
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        router.push("/doctor/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!email || !firstName || !lastName) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Sign up user
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password: phone, // Use phone as password for this flow
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            mobile: phone,
            role: "doctor",
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        // The auth trigger also creates this row, so keep this idempotent.
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          mobile: phone,
          role: "doctor",
        }, {
          onConflict: "id",
        });

        if (profileError) {
          setError(profileError.message);
          setLoading(false);
          return;
        }

        // Create onboarding status
        const { error: onboardingError } = await supabase
          .from("onboarding_status")
          .upsert({
            doctor_id: data.user.id,
            status: "draft",
          }, {
            onConflict: "doctor_id",
            ignoreDuplicates: true,
          });

        if (onboardingError) {
          console.error("Onboarding error:", onboardingError);
        }

        router.push("/doctor/onboarding");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#0C1017",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Outfit', system-ui, -apple-system, sans-serif",
    }}>
      {/* Background grid */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(59, 130, 200, 0.04) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        pointerEvents: "none",
      }} />

      {/* Top glow */}
      <div style={{
        position: "absolute",
        top: "-80px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "360px",
        height: "360px",
        background: "radial-gradient(circle, rgba(59, 130, 200, 0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 clamp(16px, 5vw, 28px)",
        position: "relative",
        zIndex: 1,
      }}>

        {/* Logo and title */}
        <div style={{ textAlign: "center", marginBottom: "44px", animation: "fadeIn 0.5s ease-out" }}>
          {/* Animated shield */}
          <div style={{
            position: "relative",
            width: "72px",
            height: "72px",
            margin: "0 auto 20px",
          }}>
            <div style={{
              position: "absolute",
              inset: "-12px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(59, 130, 200, 0.12) 0%, transparent 70%)",
              animation: "pulse 2s ease-in-out infinite",
            }} />
            <div style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "linear-gradient(145deg, rgba(59, 130, 200, 0.12), rgba(59, 130, 200, 0.04))",
              border: "1.5px solid rgba(59, 130, 200, 0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82C8" strokeWidth="1.6">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>

          <div style={{
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: "rgba(255, 255, 255, 0.75)",
            textTransform: "uppercase",
            marginBottom: "10px",
          }}>GutGuard</div>

          <div style={{
            fontSize: "clamp(26px, 6.8vw, 30px)",
            fontWeight: 800,
            color: "rgba(255, 255, 255, 0.92)",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
          }}>
            Practitioner<br />
            Protocol Center
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{
          width: "100%",
          maxWidth: "360px",
          marginBottom: "20px",
          animation: "fadeIn 0.5s ease-out 0.06s both",
        }}>
          <div style={{
            display: "flex",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: "12px",
            padding: "3px",
            gap: "3px",
          }}>
            <button
              onClick={() => setMode("signin")}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                fontSize: "14px",
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: "pointer",
                background: mode === "signin" ? "rgba(255, 255, 255, 0.08)" : "none",
                color: "#fff",
                transition: "all 0.2s",
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                fontSize: "14px",
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: "pointer",
                background: mode === "signup" ? "rgba(255, 255, 255, 0.08)" : "none",
                color: mode === "signup" ? "#fff" : "rgba(255, 255, 255, 0.62)",
                transition: "all 0.2s",
              }}
            >
              New Account
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} style={{
          width: "100%",
          maxWidth: "360px",
          animation: "fadeIn 0.5s ease-out 0.14s both",
        }}>
          {/* Mobile Number */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.58)",
              marginBottom: "8px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}>Mobile Number</label>
            <input
              type="tel"
              placeholder="09XX XXX XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "15px 18px",
                border: "1.5px solid rgba(255, 255, 255, 0.07)",
                borderRadius: "14px",
                fontFamily: "inherit",
                fontSize: "16px",
                color: "#fff",
                background: "rgba(255, 255, 255, 0.04)",
                outline: "none",
                minHeight: "52px",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "rgba(59, 130, 200, 0.40)"}
              onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)"}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.58)",
              marginBottom: "8px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}>
              Email
              <span style={{
                color: "rgba(255, 255, 255, 0.72)",
                fontWeight: 600,
                fontSize: "11px",
                letterSpacing: "0.04em",
                marginLeft: "4px",
              }}>
                · {mode === "signin" ? "for confirmations" : "required"}
              </span>
            </label>
            <input
              type="email"
              placeholder="doctor@clinic.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={mode === "signup"}
              style={{
                width: "100%",
                padding: "15px 18px",
                border: "1.5px solid rgba(255, 255, 255, 0.07)",
                borderRadius: "14px",
                fontFamily: "inherit",
                fontSize: "16px",
                color: "#fff",
                background: "rgba(255, 255, 255, 0.04)",
                outline: "none",
                minHeight: "52px",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "rgba(59, 130, 200, 0.40)"}
              onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)"}
            />
          </div>

          {/* Signup-only fields */}
          {mode === "signup" && (
            <>
              <div style={{ marginBottom: "14px" }}>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "rgba(255, 255, 255, 0.58)",
                  marginBottom: "8px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}>First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "15px 18px",
                    border: "1.5px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: "14px",
                    fontFamily: "inherit",
                    fontSize: "16px",
                    color: "#fff",
                    background: "rgba(255, 255, 255, 0.04)",
                    outline: "none",
                    minHeight: "52px",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "rgba(59, 130, 200, 0.40)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)"}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "rgba(255, 255, 255, 0.58)",
                  marginBottom: "8px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}>Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "15px 18px",
                    border: "1.5px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: "14px",
                    fontFamily: "inherit",
                    fontSize: "16px",
                    color: "#fff",
                    background: "rgba(255, 255, 255, 0.04)",
                    outline: "none",
                    minHeight: "52px",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "rgba(59, 130, 200, 0.40)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)"}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "rgba(255, 255, 255, 0.58)",
                  marginBottom: "8px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}>
                  Viber
                  <span style={{
                    color: "rgba(255, 255, 255, 0.72)",
                    fontWeight: 600,
                    fontSize: "11px",
                  }}>
                    · optional, for instant alerts
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="@yourViberName"
                  value={viber}
                  onChange={(e) => setViber(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "15px 18px",
                    border: "1.5px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: "14px",
                    fontFamily: "inherit",
                    fontSize: "16px",
                    color: "#fff",
                    background: "rgba(255, 255, 255, 0.04)",
                    outline: "none",
                    minHeight: "52px",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "rgba(59, 130, 200, 0.40)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)"}
                />
              </div>
            </>
          )}

          {/* Error message */}
          {error && (
            <div style={{
              marginBottom: "16px",
              padding: "12px 16px",
              borderRadius: "12px",
              background: "rgba(212, 32, 32, 0.1)",
              border: "1px solid rgba(212, 32, 32, 0.2)",
              fontSize: "14px",
              color: "#D42020",
            }}>
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "16px",
              border: "none",
              fontSize: "17px",
              fontWeight: 700,
              background: loading ? "rgba(59, 130, 200, 0.5)" : "#3B82C8",
              color: "#fff",
              fontFamily: "inherit",
              minHeight: "56px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.1s",
              boxShadow: "0 4px 20px rgba(59, 130, 200, 0.25)",
            }}
            onMouseDown={(e) => {
              if (!loading) e.currentTarget.style.transform = "scale(0.97)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "";
            }}
          >
            {loading ? (mode === "signin" ? "Signing In..." : "Creating Account...") : (mode === "signin" ? "Sign In" : "Create Account")}
          </button>
        </form>
      </div>

      {/* Bottom badges */}
      <div style={{
        padding: "0 clamp(16px, 5vw, 28px) 40px",
        position: "relative",
        zIndex: 1,
        animation: "fadeIn 0.5s ease-out 0.3s both",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "16px",
          gap: "8px",
          flexWrap: "wrap",
        }}>
          {["SEC Registered", "FDA Notified", "LTO Licensed", "GLIS · IMSI v1.0"].map((badge) => (
            <div key={badge} style={{
              padding: "6px 12px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              fontSize: "11px",
              fontWeight: 700,
              color: "rgba(255, 255, 255, 0.75)",
              letterSpacing: "0.06em",
            }}>
              {badge}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.08);
          }
        }
      `}</style>
    </div>
  );
}
