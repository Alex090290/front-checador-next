"use client";

import { useCallback, useState } from "react";
import LegalAcceptanceGate from "../termsAndConditions/LegalAcceptanceGate";
import PasswordSystemGate from "./PasswordSystemGate";

// Avisos después del login, uno tras otro: primero Términos y Aviso de privacidad, luego crear la contraseña
export default function PostLoginGates() {
  const [legalResolved, setLegalResolved] = useState(false);
  const handleLegalResolved = useCallback(() => setLegalResolved(true), []);

  return (
    <>
      <LegalAcceptanceGate onResolved={handleLegalResolved} />
      <PasswordSystemGate enabled={legalResolved} />
    </>
  );
}
