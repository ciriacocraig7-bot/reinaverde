-- Reina Verde NO es responsable del IVA.
-- Cambiamos el PricingConfig por defecto a régimen SIMPLE con tarifa 0,
-- de manera que la factura al cliente final NO incluya IVA ni RST.
--
-- Esto refleja la realidad operativa: empresa pequeña / persona natural
-- no responsable del IVA, sin obligación de cobrar tarifa única SIMPLE
-- (responsabilidad 49). El motor de pricing sigue siendo correcto:
-- COMMON con vatRate>0 sigue funcionando si en el futuro la empresa
-- pasa al régimen común. Solo cambiamos el DEFAULT y los valores
-- actualmente seedados.

UPDATE "pricing_config"
SET
  "taxRegime" = 'SIMPLE',
  "vatRate" = 0,
  "simpleRate" = 0,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'default';
