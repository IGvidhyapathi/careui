import * as React from "react";
import type { ColumnDef, Row } from "@tanstack/react-table";
import {
  ArrowRight,
  ClipboardList,
  History,
  Plus,
  Settings2,
  SquarePen,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { DataTable, DataTableRowActions } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface DoseLine {
  id: string;
  dosage: string;
  schedule: string | null;
  duration: string | null;
  instructions: string[];
  route: string;
  asNeeded: boolean;
}

interface MedicationRequest {
  id: string;
  medicine: string;
  doses: DoseLine[];
  note: string;
}

const SCHEDULES = [
  "1 - 0 - 1",
  "1 - 1 - 1",
  "1 - 0 - 0",
  "0 - 1 - 0",
  "0 - 0 - 1",
  "1 - 1 - 1 - 1",
];

const DURATIONS = [
  "1 Day",
  "3 Days",
  "5 Days",
  "7 Days",
  "10 Days",
  "14 Days",
  "1 Month",
];

const DOSE_UNITS = [
  "tablets",
  "gram",
  "milligram",
  "microgram",
  "milliliter",
  "drop",
  "international unit",
  "count",
];

const INSTRUCTIONS = [
  "Before food",
  "After food",
  "With food",
  "At bedtime",
  "Until symptoms improve",
  "Then stop",
  "Avoid alcohol",
];

const ROUTES = [
  "Oral",
  "Intravenous",
  "Intramuscular",
  "Subcutaneous",
  "Sublingual",
];

const MEDICINE_CATALOG = [
  "Morphine sulfate 15 mg oral tablet",
  "Paracetamol 500 mg oral tablet",
  "Amoxicillin 500 mg oral capsule",
  "Pantoprazole 40 mg oral tablet",
  "Ondansetron 4 mg oral tablet",
  "Metformin 500 mg oral tablet",
  "Atorvastatin 10 mg oral tablet",
  "Cetirizine 10 mg oral tablet",
];

const MEDICATION_TEMPLATES = [
  {
    name: "Post-operative pain",
    medicines: [
      "Morphine sulfate 15 mg oral tablet",
      "Ondansetron 4 mg oral tablet",
      "Pantoprazole 40 mg oral tablet",
    ],
  },
  {
    name: "Fever and cold",
    medicines: [
      "Paracetamol 500 mg oral tablet",
      "Cetirizine 10 mg oral tablet",
    ],
  },
  {
    name: "Type 2 diabetes follow-up",
    medicines: [
      "Metformin 500 mg oral tablet",
      "Atorvastatin 10 mg oral tablet",
    ],
  },
];

const MEDICATION_HISTORY = [
  {
    medicine: "Paracetamol 500 mg oral tablet",
    schedule: "1 - 1 - 1",
    duration: "5 Days",
    date: "12 Aug 2026",
  },
  {
    medicine: "Amoxicillin 500 mg oral capsule",
    schedule: "1 - 0 - 1",
    duration: "7 Days",
    date: "03 Jun 2026",
  },
  {
    medicine: "Pantoprazole 40 mg oral tablet",
    schedule: "1 - 0 - 0",
    duration: "14 Days",
    date: "21 Mar 2026",
  },
];

const REQUESTERS = [
  { value: "lakshmi-mohan", name: "Dr. Lakshmi Mohan", initials: "LM" },
  { value: "arjun-nair", name: "Dr. Arjun Nair", initials: "AN" },
  { value: "fatima-begum", name: "Dr. Fatima Begum", initials: "FB" },
];

let nextId = 0;
const uid = () => `med-${++nextId}`;

function parseDosage(dosage: string) {
  const match = dosage.trim().match(/^(\d+(?:\.\d+)?|\.\d+)?\s*(.*)$/);
  const amount = match?.[1] ?? "";
  const rawUnit = match?.[2]?.toLowerCase() ?? "";
  const unit =
    DOSE_UNITS.find(
      (option) => option === rawUnit || option.replace(/s$/, "") === rawUnit
    ) ?? rawUnit;
  return { amount, unit };
}

function formatDosage(amount: string, unit: string) {
  return [amount.trim(), unit].filter(Boolean).join(" ");
}

function createDose(overrides: Partial<DoseLine> = {}): DoseLine {
  return {
    id: uid(),
    dosage: "1 Tablet",
    schedule: null,
    duration: null,
    instructions: [],
    route: "Oral",
    asNeeded: false,
    ...overrides,
  };
}

function createMedication(
  medicine: string,
  overrides: Partial<Omit<MedicationRequest, "id" | "medicine">> = {}
): MedicationRequest {
  return {
    id: uid(),
    medicine,
    doses: [createDose()],
    note: "",
    ...overrides,
  };
}

const INITIAL_NOTE =
  "Medication initiated after discussing benefits and risks with the patient.";

function createInitialData(): MedicationRequest[] {
  const morphine = MEDICINE_CATALOG[0];
  return [
    createMedication(morphine, { note: INITIAL_NOTE }),
    createMedication(morphine, {
      doses: [
        createDose({ instructions: ["Until symptoms improve", "Then stop"] }),
      ],
    }),
    createMedication(morphine, { note: INITIAL_NOTE }),
    createMedication(morphine, {
      doses: [
        createDose({ schedule: "1 - 0 - 1", duration: "3 Days" }),
        createDose({ schedule: "0 - 0 - 1" }),
        createDose({ dosage: "" }),
      ],
    }),
  ];
}

// ─── Grid actions ─────────────────────────────────────────────────────────────

interface MedicationGridActions {
  updateDose: (medId: string, doseId: string, patch: Partial<DoseLine>) => void;
  doseRowHeights: Record<string, number>;
  setDoseRowHeight: (doseId: string, height: number | null) => void;
  addDose: (medId: string) => void;
  removeDose: (medId: string, doseId: string) => void;
  duplicateMedication: (medId: string) => void;
  removeMedication: (medId: string) => void;
  updateNote: (medId: string, note: string) => void;
  activeId: string | null;
  setActiveId: (medId: string | null) => void;
}

const MedicationGridContext = React.createContext<MedicationGridActions | null>(
  null
);

function useMedicationGrid() {
  const ctx = React.useContext(MedicationGridContext);
  if (!ctx) {
    throw new Error("useMedicationGrid must be used within MedicationRequest");
  }
  return ctx;
}

// ─── Cells ────────────────────────────────────────────────────────────────────

interface DoseCellProps {
  row: Row<MedicationRequest>;
}

/** Renders one line per dose so tapering doses stay aligned across columns. */
function DoseStack({
  row,
  children,
}: DoseCellProps & {
  children: (dose: DoseLine, index: number) => React.ReactNode;
}) {
  const { activeId, doseRowHeights, setActiveId } = useMedicationGrid();
  return (
    <div
      className="divide-border flex flex-col divide-y divide-dashed"
      data-row-active={activeId === row.original.id || undefined}
      onFocus={() => setActiveId(row.original.id)}
    >
      {row.original.doses.map((dose, index) => (
        <div
          key={dose.id}
          data-dose-row-id={dose.id}
          className="flex min-h-14 items-center gap-1 py-2"
          style={
            doseRowHeights[dose.id]
              ? { minHeight: doseRowHeights[dose.id] }
              : undefined
          }
        >
          {children(dose, index)}
        </div>
      ))}
    </div>
  );
}

function doseLabel(row: Row<MedicationRequest>, index: number) {
  const suffix = row.original.doses.length > 1 ? `, dose ${index + 1}` : "";
  return `${row.original.medicine}${suffix}`;
}

function DosageInput({
  dose,
  label,
  onChange,
}: {
  dose: DoseLine;
  label: string;
  onChange: (dosage: string) => void;
}) {
  const fieldRef = React.useRef<HTMLDivElement>(null);
  const { amount, unit } = parseDosage(dose.dosage);
  const hasAmount = amount.length > 0;
  const options = hasAmount
    ? DOSE_UNITS.map((option) => `${amount} ${option}`)
    : DOSE_UNITS;
  const selectedDosage = unit ? formatDosage(amount, unit) : null;

  return (
    <Combobox
      items={options}
      value={selectedDosage}
      inputValue={amount}
      onInputValueChange={(nextAmount) => {
        const selectedUnit = DOSE_UNITS.find(
          (option) => nextAmount === option || nextAmount.endsWith(` ${option}`)
        );
        onChange(
          selectedUnit
            ? formatDosage(parseDosage(nextAmount).amount, selectedUnit)
            : formatDosage(nextAmount, unit)
        );
      }}
      onValueChange={(value) => {
        if (value !== null) {
          onChange(value);
          requestAnimationFrame(() => {
            fieldRef.current?.querySelector("input")?.focus();
          });
        }
      }}
    >
      <div ref={fieldRef} className="relative w-full min-w-0">
        <ComboboxInput
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          aria-label={label}
          placeholder={unit ? undefined : "Enter a number..."}
          className="w-full min-w-0"
          inputClassName={cn(
            "tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            unit && "pr-36"
          )}
          showTrigger={false}
        >
          {unit && (
            <ComboboxTrigger
              className="text-muted-foreground absolute top-1/2 right-2 z-10 -translate-y-1/2 border-0 bg-transparent px-1 text-sm font-normal whitespace-nowrap shadow-none hover:bg-transparent"
              aria-label={`Change dose unit from ${unit}`}
              showChevron={false}
            >
              {unit}
            </ComboboxTrigger>
          )}
        </ComboboxInput>
      </div>
      <ComboboxContent side="bottom" anchor={fieldRef} className="min-w-0">
        <ComboboxEmpty>No dose units found.</ComboboxEmpty>
        <ComboboxList className="max-h-none">
          {(option: string) => (
            <ComboboxItem
              key={option}
              value={option}
              className="min-h-10 whitespace-nowrap"
            >
              {option}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function DosageCell({ row }: DoseCellProps) {
  const { updateDose, addDose } = useMedicationGrid();
  return (
    <DoseStack row={row}>
      {(dose, index) => (
        <>
          <DosageInput
            dose={dose}
            label={`Dosage amount for ${doseLabel(row, index)}`}
            onChange={(dosage) =>
              updateDose(row.original.id, dose.id, { dosage })
            }
          />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Add tapering dose to ${row.original.medicine}`}
            onClick={() => addDose(row.original.id)}
          >
            <Plus />
          </Button>
        </>
      )}
    </DoseStack>
  );
}

function OptionSelectCell({
  row,
  field,
  label,
  placeholder,
  options,
}: DoseCellProps & {
  field: "schedule" | "duration";
  label: string;
  placeholder: string;
  options: string[];
}) {
  const { updateDose } = useMedicationGrid();
  return (
    <DoseStack row={row}>
      {(dose, index) => (
        <Select
          value={dose[field]}
          onValueChange={(value) =>
            updateDose(row.original.id, dose.id, { [field]: value })
          }
        >
          <SelectTrigger
            className="bg-background w-full min-w-0"
            aria-label={`${label} for ${doseLabel(row, index)}`}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </DoseStack>
  );
}

function InstructionsCell({ row }: DoseCellProps) {
  const { updateDose, activeId, setDoseRowHeight } = useMedicationGrid();
  const expanded = activeId === row.original.id;
  const stackRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const doseRows =
      stackRef.current?.querySelectorAll<HTMLElement>("[data-dose-row-id]");
    if (!expanded || !doseRows) {
      row.original.doses.forEach((dose) => setDoseRowHeight(dose.id, null));
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const doseId = (entry.target as HTMLElement).dataset.doseRowId;
        if (doseId) {
          setDoseRowHeight(
            doseId,
            Math.ceil(entry.target.getBoundingClientRect().height)
          );
        }
      });
    });
    doseRows.forEach((doseRow) => {
      const doseId = doseRow.dataset.doseRowId;
      if (doseId) {
        setDoseRowHeight(
          doseId,
          Math.ceil(doseRow.getBoundingClientRect().height)
        );
      }
      resizeObserver.observe(doseRow);
    });

    return () => resizeObserver.disconnect();
  }, [expanded, row.original.doses, setDoseRowHeight]);

  return (
    <div ref={stackRef}>
      <DoseStack row={row}>
        {(dose, index) => (
          <Select
            modal={false}
            multiple
            value={dose.instructions}
            onValueChange={(value) =>
              updateDose(row.original.id, dose.id, { instructions: value })
            }
          >
            <SelectTrigger
              className={cn(
                "bg-background w-full min-w-0",
                expanded &&
                  "min-h-12 py-1.5 data-[size=default]:h-auto md:min-h-10 md:data-[size=default]:h-auto"
              )}
              aria-label={`Instructions for ${doseLabel(row, index)}`}
            >
              <SelectValue
                className={cn("min-w-0", expanded && "flex-wrap gap-1")}
              >
                {(value: string[]) => {
                  if (value.length === 0) return "Select instructions";
                  const visible = expanded ? value : value.slice(0, 1);
                  return (
                    <>
                      {visible.map((item) => (
                        <Badge
                          key={item}
                          variant="purple"
                          size="sm"
                          className="max-w-full min-w-0 shrink"
                        >
                          <span className="truncate">{item}</span>
                        </Badge>
                      ))}
                      {!expanded && value.length > 1 && (
                        <Badge variant="neutral" size="sm" className="shrink-0">
                          +{value.length - 1}
                        </Badge>
                      )}
                    </>
                  );
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {INSTRUCTIONS.map((instruction) => (
                <SelectItem key={instruction} value={instruction}>
                  {instruction}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </DoseStack>
    </div>
  );
}

function DoseOptionsCell({ row }: DoseCellProps) {
  const { updateDose } = useMedicationGrid();
  return (
    <DoseStack row={row}>
      {(dose, index) => {
        const switchId = `${dose.id}-prn`;
        const routeId = `${dose.id}-route`;
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="mx-auto"
                aria-label={`More options for ${doseLabel(row, index)}`}
              >
                <ArrowRight />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <PopoverHeader>
                <PopoverTitle>Dose options</PopoverTitle>
                <PopoverDescription>{doseLabel(row, index)}</PopoverDescription>
              </PopoverHeader>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={routeId}>Route</FieldLabel>
                  <Select
                    value={dose.route}
                    onValueChange={(value) =>
                      value &&
                      updateDose(row.original.id, dose.id, { route: value })
                    }
                  >
                    <SelectTrigger id={routeId} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      {ROUTES.map((route) => (
                        <SelectItem key={route} value={route}>
                          {route}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field orientation="horizontal">
                  <FieldLabel htmlFor={switchId}>As needed (PRN)</FieldLabel>
                  <Switch
                    id={switchId}
                    checked={dose.asNeeded}
                    onCheckedChange={(checked) =>
                      updateDose(row.original.id, dose.id, {
                        asNeeded: checked,
                      })
                    }
                  />
                </Field>
              </FieldGroup>
            </PopoverContent>
          </Popover>
        );
      }}
    </DoseStack>
  );
}

function RowActionsCell({ row }: DoseCellProps) {
  const { addDose, removeDose, duplicateMedication, removeMedication } =
    useMedicationGrid();
  const medication = row.original;
  return (
    <DoseStack row={row}>
      {(dose) => (
        <DataTableRowActions>
          <DropdownMenuItem onClick={() => addDose(medication.id)}>
            Add tapering dose
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => duplicateMedication(medication.id)}>
            Duplicate medicine
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {medication.doses.length > 1 && (
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => removeDose(medication.id, dose.id)}
            >
              Remove this dose
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => removeMedication(medication.id)}
          >
            Remove medicine
          </DropdownMenuItem>
        </DataTableRowActions>
      )}
    </DoseStack>
  );
}

/** Saved notes read as text until their row is active; clicking the text edits it. */
function NoteRow({ medication }: { medication: MedicationRequest }) {
  const { updateNote, activeId, setActiveId } = useMedicationGrid();
  const [focusOnMount, setFocusOnMount] = React.useState(false);
  const isActive = activeId === medication.id;

  const focusAtEnd = React.useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  if (medication.note && !isActive) {
    return (
      <div className="px-3 py-1.5">
        <button
          type="button"
          className="focus-visible:ring-ring/50 flex w-full cursor-text items-center gap-2 rounded-sm text-left text-sm whitespace-normal outline-none focus-visible:ring-3"
          onClick={() => {
            setFocusOnMount(true);
            setActiveId(medication.id);
          }}
        >
          <span className="flex-1">
            <span className="font-medium">Note:</span> {medication.note}
          </span>
          <span className="sr-only">(edit note)</span>
          <SquarePen
            aria-hidden="true"
            className="text-muted-foreground size-4 shrink-0"
          />
        </button>
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      <Textarea
        rows={1}
        className="bg-background min-h-10 resize-none"
        aria-label={`Note for ${medication.medicine}`}
        placeholder="Add note"
        value={medication.note}
        ref={focusOnMount ? focusAtEnd : undefined}
        onFocus={() => setActiveId(medication.id)}
        onBlur={() => setFocusOnMount(false)}
        onChange={(e) => updateNote(medication.id, e.target.value)}
      />
    </div>
  );
}

const columns: ColumnDef<MedicationRequest>[] = [
  {
    id: "sl",
    header: "Sl.",
    cell: ({ row }) => `${row.index + 1}.`,
    meta: {
      className: "w-12 text-center cursor-pointer",
      spanExpandedRow: true,
    },
  },
  {
    id: "medicine",
    accessorKey: "medicine",
    header: "Medicine",
    meta: {
      className:
        "w-[20%] cursor-pointer whitespace-normal font-medium @max-2xl:flex-1",
      spanExpandedRow: true,
    },
  },
  {
    id: "dosage",
    header: "Dosage",
    cell: ({ row }) => <DosageCell row={row} />,
    meta: { className: "w-[20%] @max-2xl:basis-full" },
  },
  {
    id: "schedule",
    header: "Schedule",
    cell: ({ row }) => (
      <OptionSelectCell
        row={row}
        field="schedule"
        label="Schedule"
        placeholder="e.g. 1 - 0 - 1"
        options={SCHEDULES}
      />
    ),
    meta: {
      className: "w-[14%] whitespace-nowrap @max-2xl:w-fit @max-2xl:basis-auto",
    },
  },
  {
    id: "duration",
    header: "Duration",
    cell: ({ row }) => (
      <OptionSelectCell
        row={row}
        field="duration"
        label="Duration"
        placeholder="e.g. 5 Days"
        options={DURATIONS}
      />
    ),
    meta: {
      className: "w-[12%] whitespace-nowrap @max-2xl:w-fit @max-2xl:basis-auto",
    },
  },
  {
    id: "instructions",
    header: "Instructions",
    cell: ({ row }) => <InstructionsCell row={row} />,
    meta: { className: "@max-2xl:flex-1" },
  },
  {
    id: "options",
    header: "Options",
    cell: ({ row }) => <DoseOptionsCell row={row} />,
    meta: { className: "w-16" },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RowActionsCell row={row} />,
    meta: { className: "w-14" },
  },
];

const gridClassName = cn(
  "@container [&_table]:table-fixed",
  // Active record: tint and outline the row together with its note.
  "[&_tbody:has([data-row-active])]:bg-primary-50 dark:[&_tbody:has([data-row-active])]:bg-primary-950/40",
  "[&_tbody:has([data-row-active])]:outline-primary [&_tbody:has([data-row-active])]:outline-2 [&_tbody:has([data-row-active])]:-outline-offset-2",
  "[&_tbody:has([data-row-active])_tr:hover]:bg-transparent",
  // Narrow containers stack cells instead of scrolling horizontally.
  "@max-2xl:[&_thead]:hidden @max-2xl:[&_table]:block @max-2xl:[&_tbody]:block",
  "@max-2xl:[&_tr]:flex @max-2xl:[&_tr]:flex-wrap @max-2xl:[&_tr]:items-center",
  "@max-2xl:[&_td]:block @max-2xl:[&_td:not(:last-child)]:border-r-0 @max-2xl:[&_td[colspan]]:w-full"
);

// ─── Template ─────────────────────────────────────────────────────────────────

export function MedicationRequestTemplate() {
  const [medications, setMedications] = React.useState(createInitialData);
  const [requester, setRequester] = React.useState(REQUESTERS[0].value);
  const [requestNote, setRequestNote] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [dense, setDense] = React.useState(false);
  const [cellBorder, setCellBorder] = React.useState(true);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [doseRowHeights, setDoseRowHeights] = React.useState<
    Record<string, number>
  >({});
  const [focusDoseId, setFocusDoseId] = React.useState<string | null>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);

  const updateMedication = React.useCallback(
    (medId: string, update: (m: MedicationRequest) => MedicationRequest) =>
      setMedications((prev) =>
        prev.map((m) => (m.id === medId ? update(m) : m))
      ),
    []
  );

  const setDoseRowHeight = React.useCallback(
    (doseId: string, height: number | null) => {
      setDoseRowHeights((previous) => {
        if (height === null) {
          if (!(doseId in previous)) return previous;
          const next = { ...previous };
          delete next[doseId];
          return next;
        }
        if (previous[doseId] === height) return previous;
        return { ...previous, [doseId]: height };
      });
    },
    []
  );

  const actions = React.useMemo<MedicationGridActions>(
    () => ({
      doseRowHeights,
      setDoseRowHeight,
      updateDose: (medId, doseId, patch) =>
        updateMedication(medId, (m) => ({
          ...m,
          doses: m.doses.map((d) => (d.id === doseId ? { ...d, ...patch } : d)),
        })),
      addDose: (medId) =>
        updateMedication(medId, (m) => ({
          ...m,
          doses: [...m.doses, createDose({ dosage: "" })],
        })),
      removeDose: (medId, doseId) =>
        updateMedication(medId, (m) => ({
          ...m,
          doses: m.doses.filter((d) => d.id !== doseId),
        })),
      duplicateMedication: (medId) =>
        setMedications((prev) => {
          const index = prev.findIndex((m) => m.id === medId);
          if (index === -1) return prev;
          const source = prev[index];
          const copy: MedicationRequest = {
            ...source,
            id: uid(),
            doses: source.doses.map((d) => ({ ...d, id: uid() })),
          };
          return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
        }),
      removeMedication: (medId) =>
        setMedications((prev) => prev.filter((m) => m.id !== medId)),
      updateNote: (medId, note) =>
        updateMedication(medId, (m) => ({ ...m, note })),
      activeId,
      setActiveId,
    }),
    [updateMedication, activeId, doseRowHeights, setDoseRowHeight]
  );

  // Clear the active row when focus or a click lands outside the grid and its popups.
  React.useEffect(() => {
    const handleOutside = (event: Event) => {
      const target = event.target as Element | null;
      if (
        !target ||
        gridRef.current?.contains(target) ||
        target.closest('[data-slot$="-content"]')
      ) {
        return;
      }
      // An outside press that only dismisses a grid popup returns focus to its trigger.
      if (
        event.type === "pointerdown" &&
        gridRef.current?.querySelector('[aria-haspopup][aria-expanded="true"]')
      ) {
        return;
      }
      setActiveId(null);
    };
    // Capture on window so this runs before popups react to the outside press.
    window.addEventListener("pointerdown", handleOutside, true);
    document.addEventListener("focusin", handleOutside);
    return () => {
      window.removeEventListener("pointerdown", handleOutside, true);
      document.removeEventListener("focusin", handleOutside);
    };
  }, []);

  const addMedicines = (
    entries: { medicine: string; dose?: Partial<DoseLine> }[]
  ) => {
    const created = entries.map(({ medicine, dose }) =>
      createMedication(medicine, { doses: [createDose(dose)] })
    );
    setMedications((prev) => [...prev, ...created]);
    setActiveId(created[0].id);
    setFocusDoseId(created[0].doses[0].id);
  };

  // Wait a frame so closing menus/comboboxes don't steal focus back.
  React.useEffect(() => {
    if (!focusDoseId) return;
    const frame = requestAnimationFrame(() => {
      const input = document.getElementById(`${focusDoseId}-dosage`);
      input?.scrollIntoView({ block: "nearest" });
      input?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [focusDoseId]);

  const activeRequester = REQUESTERS.find((r) => r.value === requester);

  return (
    <MedicationGridContext.Provider value={actions}>
      <Card>
        <CardHeader>
          <CardTitle>
            Advice medicine{" "}
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </CardTitle>
          <CardDescription>
            {medications.length}{" "}
            {medications.length === 1 ? "medicine" : "medicines"} in this
            request
          </CardDescription>
          <CardAction className="flex flex-wrap justify-end gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Medication history"
                >
                  <History />
                  <span className="hidden sm:inline">Medication history</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Previously prescribed</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {MEDICATION_HISTORY.map((entry) => (
                  <DropdownMenuItem
                    key={entry.medicine}
                    className="flex-col items-start gap-0.5"
                    onClick={() =>
                      addMedicines([
                        {
                          medicine: entry.medicine,
                          dose: {
                            schedule: entry.schedule,
                            duration: entry.duration,
                          },
                        },
                      ])
                    }
                  >
                    <span>{entry.medicine}</span>
                    <span className="text-muted-foreground text-xs">
                      {entry.schedule} · {entry.duration} · {entry.date}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Template">
                  <ClipboardList />
                  <span className="hidden sm:inline">Template</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Apply a template</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {MEDICATION_TEMPLATES.map((template) => (
                  <DropdownMenuItem
                    key={template.name}
                    className="flex-col items-start gap-0.5"
                    onClick={() =>
                      addMedicines(
                        template.medicines.map((medicine) => ({ medicine }))
                      )
                    }
                  >
                    <span>{template.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {template.medicines.length} medicines
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Table settings"
                >
                  <Settings2 />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Table settings</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={dense}
                  onCheckedChange={(value) => setDense(!!value)}
                >
                  Compact rows
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={cellBorder}
                  onCheckedChange={(value) => setCellBorder(!!value)}
                >
                  Cell borders
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {/* Clicks on the spanned Sl./Medicine cells focus that row's first dosage input. */}
          <div
            ref={gridRef}
            onClick={(event) =>
              (event.target as Element)
                .closest("td[rowspan]")
                ?.closest("tbody")
                ?.querySelector<HTMLInputElement>("input")
                ?.focus()
            }
          >
            <DataTable
              columns={columns}
              data={medications}
              hideToolbar
              cellBorder={cellBorder}
              dense={dense}
              defaultExpanded={true}
              className={gridClassName}
              renderExpandedRow={(row) => (
                <NoteRow key={row.original.id} medication={row.original} />
              )}
            />
          </div>

          <Combobox
            items={MEDICINE_CATALOG}
            value={null}
            inputValue={search}
            onInputValueChange={setSearch}
            onValueChange={(value) => {
              if (!value) return;
              addMedicines([{ medicine: value }]);
              setSearch("");
            }}
          >
            <ComboboxInput
              aria-label="Search medicine to add"
              placeholder="Search medicine to add"
              className="w-full"
            />
            <ComboboxContent>
              <ComboboxEmpty>No medicines found.</ComboboxEmpty>
              <ComboboxList>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          <div className="grid gap-4 md:grid-cols-[minmax(0,18rem)_1fr]">
            <Field>
              <FieldLabel htmlFor="medication-requester">
                Requester for all entries
              </FieldLabel>
              <Select
                value={requester}
                onValueChange={(value) => value && setRequester(value)}
              >
                <SelectTrigger id="medication-requester" className="w-full">
                  <SelectValue>
                    {activeRequester && (
                      <>
                        <Avatar size="sm">
                          <AvatarFallback>
                            {activeRequester.initials}
                          </AvatarFallback>
                        </Avatar>
                        {activeRequester.name}
                      </>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {REQUESTERS.map((person) => (
                    <SelectItem key={person.value} value={person.value}>
                      <Avatar size="sm">
                        <AvatarFallback>{person.initials}</AvatarFallback>
                      </Avatar>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="medication-request-note">Note</FieldLabel>
              <Input
                id="medication-request-note"
                placeholder="Add a note for the whole request"
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
              />
            </Field>
          </div>
        </CardContent>
      </Card>
    </MedicationGridContext.Provider>
  );
}
