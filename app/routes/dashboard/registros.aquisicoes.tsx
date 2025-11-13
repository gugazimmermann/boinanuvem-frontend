import { useEffect } from "react";
import { useNavigate } from "react-router";
import { ROUTES } from "~/routes.config";

export default function Acquisitions() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(ROUTES.ANIMALS, { replace: true });
  }, [navigate]);

  return null;
}

