import type { SelectOption } from "../components/SelectField";

export function toOptions(values: string[]): SelectOption[] {
  return values.map((value) => ({ label: value, value }));
}
