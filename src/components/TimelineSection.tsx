import type { CalculatorInputs } from "../types";
import { NumberField } from "./NumberField";
import { Section } from "./Section";

interface Props {
  inputs: CalculatorInputs;
  update: (patch: Partial<CalculatorInputs>) => void;
}

export function TimelineSection({ inputs, update }: Props) {
  return (
    <Section step="Step 04" title="Your launch window" id="timeline">
      <NumberField
        label="How many days until launch?"
        value={inputs.daysUntilLaunch}
        onChange={(n) => update({ daysUntilLaunch: n })}
        placeholder="14"
        helper="Used to calculate your daily warm-buyer target."
      />
    </Section>
  );
}
