import { business } from "../../config/business.ts";

export function OpeningHours() {
  return (
    <dl className="tabular divide-y divide-linha border-y border-linha">
      {business.opening.map((p) => (
        <div key={p.label} className="flex items-baseline justify-between gap-6 py-3">
          <dt className="text-aco">{p.label}</dt>
          <dd className="font-semibold text-osso">
            {p.opens} às {p.closes}
          </dd>
        </div>
      ))}
    </dl>
  );
}
