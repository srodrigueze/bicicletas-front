"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { apiFetch } from "@/lib/api/client-fetch";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Client } from "@/lib/api/types";

const MIN_QUERY_LENGTH = 3;

export function ClientSearchCombobox({
  id,
  inputValue,
  onInputValueChange,
  onSelectClient,
}: {
  id: string;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  onSelectClient: (client: Client) => void;
}) {
  const debouncedQuery = useDebouncedValue(inputValue, 300);
  const enabled = debouncedQuery.trim().length >= MIN_QUERY_LENGTH;

  const { data: clients, isFetching } = useQuery({
    queryKey: ["clients", "search", debouncedQuery],
    queryFn: () =>
      apiFetch<Client[]>(`/api/clients?document=${encodeURIComponent(debouncedQuery)}&limit=10`),
    enabled,
    staleTime: 30_000,
  });

  const results = clients ?? [];

  return (
    <Combobox
      items={results}
      filter={null}
      inputValue={inputValue}
      onInputValueChange={onInputValueChange}
      onValueChange={(client) => {
        if (client) onSelectClient(client as Client);
      }}
      itemToStringLabel={(client) => (client as Client).document}
    >
      <ComboboxInput id={id} placeholder="Escribe el número de documento" showTrigger={false} inputMode="numeric" />
      <ComboboxContent>
        <ComboboxList>
          {(client: Client) => (
            <ComboboxItem key={client.id} value={client}>
              <span className="font-mono">{client.document}</span>
              <span className="text-muted-foreground">{client.full_name}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>
          {!enabled
            ? `Escribe al menos ${MIN_QUERY_LENGTH} dígitos`
            : isFetching
              ? "Buscando..."
              : "Sin coincidencias — se registrará como cliente nuevo"}
        </ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
