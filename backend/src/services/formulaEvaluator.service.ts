/**
 * FormulaEvaluator — safe arithmetic expression evaluator for payroll concepts.
 *
 * Uses mathjs to evaluate formulas without eval(). The scope contains:
 *   • System variables: salario_basico, salario_diario, dias_trabajados, horas_jornada
 *   • Attendance variables: dias_presente, dias_permiso, dias_reposo, dias_vacaciones, dias_ausente, dias_feriado
 *   • Per-run user inputs: horas_viaje, horas_bono_nocturno, etc. (from PayrollRunInput)
 *   • Previously evaluated concept amounts, keyed by concept code: A, C, PRIMA_ESP, ...
 *
 * Example formula: "(A + C + F) / dias_trabajados * 1.5"
 */

import { create, all } from 'mathjs'

// Create a limited mathjs instance — no random, no matrix operations needed
const math = create(all)

export interface FormulaScope {
  [key: string]: number
}

export interface EvaluateResult {
  ok: true
  value: number
}

export interface EvaluateError {
  ok: false
  error: string
}

export type EvaluateOutcome = EvaluateResult | EvaluateError

/**
 * Evaluate a payroll formula expression against a scope.
 * Returns the numeric result or an error descriptor (never throws).
 */
export function evaluateFormula(
  formula: string,
  scope: FormulaScope
): EvaluateOutcome {
  try {
    const result = math.evaluate(formula, { ...scope })
    if (typeof result !== 'number' || !isFinite(result)) {
      return {
        ok: false,
        error: `La fórmula no produjo un número válido (resultado: ${result})`,
      }
    }
    return { ok: true, value: result }
  } catch (err: any) {
    return { ok: false, error: err?.message ?? 'Error al evaluar fórmula' }
  }
}

/**
 * Validate a formula string without a real scope.
 * Replaces all identifiers with 1 and tries to evaluate.
 * Returns null if valid, or an error message string.
 */
export function validateFormula(formula: string): string | null {
  // Replace all word tokens that look like variable names with 1
  const testFormula = formula.replace(/\b[A-Za-z_][A-Za-z0-9_]*\b/g, '1')
  const outcome = evaluateFormula(testFormula, {})
  if (outcome.ok === false) return outcome.error
  return null
}

/**
 * Build the initial scope for a specific employee in a payroll run.
 * Attendance variables (optional):
 *   - dias_presente: days marked as present
 *   - dias_permiso: permission days (remunerated)
 *   - dias_reposo: medical leave days
 *   - dias_vacaciones: vacation days
 *   - dias_ausente: absent days (unjustified)
 *   - dias_feriado: holiday days worked
 */
export function buildBaseScope(params: {
  salarioBasico: number
  diasTrabajados: number
  horasJornada?: number
  inputVars?: Record<string, number>
  attendanceVars?: {
    dias_presente?: number
    dias_permiso?: number
    dias_reposo?: number
    dias_vacaciones?: number
    dias_ausente?: number
    dias_feriado?: number
  }
}): FormulaScope {
  const {
    salarioBasico,
    diasTrabajados,
    horasJornada = 8,
    inputVars = {},
    attendanceVars = {},
  } = params

  const salarioDiario = diasTrabajados > 0 ? salarioBasico / diasTrabajados : 0

  return {
    salario_basico: salarioBasico,
    salario_diario: salarioDiario,
    salario_hora: salarioBasico / (diasTrabajados * horasJornada) || 0,
    dias_trabajados: diasTrabajados,
    horas_jornada: horasJornada,
    // Attendance variables
    dias_presente: attendanceVars.dias_presente ?? 0,
    dias_permiso: attendanceVars.dias_permiso ?? 0,
    dias_reposo: attendanceVars.dias_reposo ?? 0,
    dias_vacaciones: attendanceVars.dias_vacaciones ?? 0,
    dias_ausente: attendanceVars.dias_ausente ?? 0,
    dias_feriado: attendanceVars.dias_feriado ?? 0,
    ...inputVars,
  }
}
