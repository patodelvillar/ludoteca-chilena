"use client";

import { useActionState } from "react";
import type { PersonRole } from "@prisma/client";
import {
  addGamePerson,
  deleteGamePerson,
  updateGameTaxonomy,
  type GameActionState,
} from "./actions";

const initialState: GameActionState = { success: false, message: "" };

const roleOptions: { value: PersonRole; label: string }[] = [
  { value: "author", label: "Autor" },
  { value: "designer", label: "Diseñador" },
  { value: "artist", label: "Artista" },
  { value: "illustrator", label: "Ilustrador" },
  { value: "developer", label: "Desarrollador" },
  { value: "graphic_designer", label: "Diseñador gráfico" },
  { value: "sculptor", label: "Escultor" },
  { value: "editor", label: "Editor" },
  { value: "writer", label: "Escritor" },
  { value: "insert_designer", label: "Diseñador de insertos" },
];

interface GameRelationsManagerProps {
  gameId: string;
  selectedMechanicIds: string[];
  selectedCategoryIds: string[];
  mechanics: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  peopleOptions: { id: string; display_name: string }[];
  people: {
    id: string;
    role: PersonRole;
    person: {
      id: string;
      display_name: string;
    };
  }[];
}

export function GameRelationsManager({
  gameId,
  selectedMechanicIds,
  selectedCategoryIds,
  mechanics,
  categories,
  peopleOptions,
  people,
}: GameRelationsManagerProps) {
  const [taxonomyState, taxonomyAction, isSavingTaxonomy] = useActionState(updateGameTaxonomy, initialState);
  const [personState, personAction, isAddingPerson] = useActionState(addGamePerson, initialState);

  return (
    <section className="mt-6 rounded-md border border-[var(--color-border)] bg-white p-5">
      <div className="mb-5">
        <h3
          className="text-lg font-bold text-[var(--color-brand-blue)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Relaciones
        </h3>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Mecánicas, categorías y personas acreditadas que aparecen en la ficha pública.
        </p>
      </div>

      <form action={taxonomyAction} className="grid gap-5 lg:grid-cols-2">
        <input type="hidden" name="gameId" value={gameId} />
        <CheckboxGroup
          title="Mecánicas"
          name="mechanicIds"
          options={mechanics}
          selectedIds={selectedMechanicIds}
          emptyText="No hay mecánicas cargadas."
        />
        <CheckboxGroup
          title="Categorías"
          name="categoryIds"
          options={categories}
          selectedIds={selectedCategoryIds}
          emptyText="No hay categorías cargadas."
        />
        <div className="flex items-center gap-3 lg:col-span-2">
          <button disabled={isSavingTaxonomy} className="admin-button-primary px-4 py-2.5 text-sm disabled:opacity-60">
            {isSavingTaxonomy ? "Guardando..." : "Guardar mecánicas y categorías"}
          </button>
          {taxonomyState.message && (
            <p className={`text-xs font-bold ${taxonomyState.success ? "text-[var(--color-brand-blue)]" : "text-[var(--color-brand-red)]"}`}>
              {taxonomyState.message}
            </p>
          )}
        </div>
      </form>

      <div className="mt-8 border-t border-[var(--color-border)] pt-5">
        <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          Personas acreditadas
        </h4>
        <form action={personAction} className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          <input type="hidden" name="gameId" value={gameId} />
          <select name="personId" required className={inputClass}>
            <option value="">Seleccionar persona</option>
            {peopleOptions.map((person) => (
              <option key={person.id} value={person.id}>
                {person.display_name}
              </option>
            ))}
          </select>
          <select name="role" required defaultValue="designer" className={inputClass}>
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <button disabled={isAddingPerson} className="admin-button-primary px-4 py-2.5 text-sm disabled:opacity-60">
            {isAddingPerson ? "Agregando..." : "Agregar"}
          </button>
          {personState.message && (
            <p className={`text-xs font-bold lg:col-span-3 ${personState.success ? "text-[var(--color-brand-blue)]" : "text-[var(--color-brand-red)]"}`}>
              {personState.message}
            </p>
          )}
        </form>

        <div className="mt-4 divide-y divide-[var(--color-border)] rounded-md border border-[var(--color-border)]">
          {people.length > 0 ? (
            people.map((item) => (
              <article key={item.id} className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-[var(--color-brand-blue)]">{item.person.display_name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {roleOptions.find((role) => role.value === item.role)?.label || item.role}
                  </p>
                </div>
                <form action={deleteGamePerson}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="gameId" value={gameId} />
                  <button className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100">
                    Quitar
                  </button>
                </form>
              </article>
            ))
          ) : (
            <p className="px-4 py-6 text-sm text-[var(--color-text-muted)]">No hay personas vinculadas.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function CheckboxGroup({
  title,
  name,
  options,
  selectedIds,
  emptyText,
}: {
  title: string;
  name: string;
  options: { id: string; name: string }[];
  selectedIds: string[];
  emptyText: string;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
        {title}
      </legend>
      <div className="max-h-72 space-y-1 overflow-auto rounded-md border border-[var(--color-border)] bg-[var(--color-cream)] p-2">
        {options.length > 0 ? (
          options.map((option) => (
            <label key={option.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-white">
              <input name={name} type="checkbox" value={option.id} defaultChecked={selectedIds.includes(option.id)} />
              <span>{option.name}</span>
            </label>
          ))
        ) : (
          <p className="px-2 py-4 text-sm text-[var(--color-text-muted)]">{emptyText}</p>
        )}
      </div>
    </fieldset>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue-pale)]";
