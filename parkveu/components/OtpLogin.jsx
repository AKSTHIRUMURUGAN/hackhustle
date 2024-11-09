"use client";
import { auth } from "../firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "./ui/input-otp";

function OtpLogin() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  useEffect(() => {
    const recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
      }
    );

    setRecaptchaVerifier(recaptchaVerifier);

    return () => {
      recaptchaVerifier.clear();
    };
  }, []);

  useEffect(() => {
    if (otp.length === 6) {
      verifyOtp();
    }
  }, [otp]);

  const requestOtp = async () => {
    setError(null);
    setSuccess(null);

    if (!recaptchaVerifier) {
      setError("RecaptchaVerifier is not initialized.");
      return;
    }

    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier
      );
      setConfirmationResult(confirmationResult);
      setResendCountdown(60);
      setSuccess("OTP sent successfully.");
    } catch (err) {
      console.log(err);
      if (err.code === "auth/invalid-phone-number") {
        setError("Invalid phone number. Please check the number.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please try again later.");
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    }
  };

  const verifyOtp = async () => {
    setError(null);
    setSuccess(null);

    if (!confirmationResult) {
      setError("Please request OTP first.");
      return;
    }

    try {
      await confirmationResult.confirm(otp);
      alert("Successfully logged in!");
      setOtp("")
      setPhoneNumber("")
    } catch (error) {
      console.log(error);
      setError("Failed to verify OTP. Please check the OTP.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex space-x-4">
        <Input
          className="text-black"
          type="tel"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">{success}</p>}

      <Button
        className="mt-4"
        onClick={requestOtp}
        disabled={!phoneNumber || resendCountdown > 0}
      >
        {resendCountdown > 0
          ? `Resend OTP in ${resendCountdown}s`
          : "Send OTP"}
      </Button>

      <div id="recaptcha-container"></div>
    </div>
  );
}

export default OtpLogin;
