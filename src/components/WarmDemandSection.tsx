import type { CalculatorInputs } from "../types";
import { formatNumber } from "../lib/calculations";
import { NumberField } from "./NumberField";
import { Section } from "./Section";

interface Props {
  inputs: CalculatorInputs;
  update: (patch: Partial<CalculatorInputs>) => void;
}

export function WarmDemandSection({ inputs, update }: Props) {
  const total =
    (inputs.emailList || 0) +
    (inputs.smsList || 0) +
    (inputs.igBroadcast || 0) +
    (inputs.waitlistVip || 0) +
    (inputs.otherDirect || 0);

  return (
    <Section
      step="Step 02"
      title="Your warm demand"
      helper="Add the people you can reach directly before launch. Leave blank if a channel doesn't apply."
      id="warm-demand"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <NumberField
          label="Email list"
          value={inputs.emailList}
          onChange={(n) => update({ emailList: n })}
          placeholder="500"
        />
        <NumberField
          label="SMS list"
          value={inputs.smsList}
          onChange={(n) => update({ smsList: n })}
          placeholder="150"
        />
        <NumberField
          label="IG broadcast or community"
          value={inputs.igBroadcast}
          onChange={(n) => update({ igBroadcast: n })}
          placeholder="300"
          helper="Broadcast channel, Close Friends, community group, or similar."
        />
        <NumberField
          label="Waitlist / VIP / early-access list"
          value={inputs.waitlistVip}
          onChange={(n) => update({ waitlistVip: n })}
          placeholder="100"
        />
        <NumberField
          label="Other direct audience"
          value={inputs.otherDirect}
          onChange={(n) => update({ otherDirect: n })}
          placeholder="0"
          helper="Any group you can message directly before the drop."
          className="sm:col-span-2"
        />
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:px-5 rounded-2xl bg-cream-100/60 border border-cream-200">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink-400 font-medium">
            Total Warm Reach
          </p>
          <p className="font-serif text-2xl text-ink-900 mt-0.5">
            {formatNumber(total)}{" "}
            <span className="text-ink-400 text-sm font-sans align-middle">
              people
            </span>
          </p>
        </div>
        <p className="text-[12px] text-ink-400 sm:max-w-[260px] leading-relaxed">
          Some people may be on multiple lists, so this is an estimate — not a
          perfect count.
        </p>
      </div>
    </Section>
  );
}
