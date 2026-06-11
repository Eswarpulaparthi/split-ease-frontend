import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { handleGoogleCallback } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    const loginUser = async () => {
      if (token) {
        await handleGoogleCallback(token);
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    };

    loginUser();
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      Logging you in...
    </div>
  );
};

export default OAuthSuccess;
