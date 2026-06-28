<RULE>
# STRICT PHASE TRANSITION & AUDITOR WORKFLOW
When working on a phased implementation plan (e.g., tracked in `task.md`):
1. NEVER consider a phase complete, transition to the next phase, or ask the user for permission to proceed without first acting as the "Auditor".
2. **Autonomous Documentation:** Automatically update `README.md`, `CHANGELOG.md`, and `docs/DECISIONES_ESTRATEGICAS.md` (ADRs) to reflect all architectural decisions and features completed in the current phase.
3. Only AFTER the documentation is fully synchronized may you inform the user that the phase is complete, present the documentation changes, and request permission to begin the next phase.
</RULE>

<RULE>
# COMANDO ESPECIAL $d: DOCUMENTACIÓN POR ARQUITECTO DE SISTEMAS
Cuando el usuario escriba exactamente el comando `$d`:
1. Debes asumir inmediatamente el rol de Arquitecto de Sistemas senior de una consultora de TI.
2. Debes auditar e inspeccionar los cambios recientes del proyecto y actualizar de forma autónoma toda la documentación oficial del proyecto (`README.md`, `CHANGELOG.md`, `docs/DECISIONES_ESTRATEGICAS.md`, `task.md` y `walkthrough.md` si aplica).
3. Redacta las actualizaciones con un tono sumamente profesional, técnico, estructurado y de nivel de consultoría de TI.
</RULE>
