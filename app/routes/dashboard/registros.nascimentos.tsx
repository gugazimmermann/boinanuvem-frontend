import { useEffect } from "react";
import { useNavigate } from "react-router";
import { ROUTES } from "~/routes.config";

export function meta() {
  return [
    { title: "Nascimentos - Boi na Nuvem" },
    {
      name: "description",
      content: "Listagem de nascimentos",
    },
  ];
}

export default function Births() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(ROUTES.ANIMALS);
  }, [navigate]);

  return null;
}
