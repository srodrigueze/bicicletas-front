"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@/components/ui/autocomplete";
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
    <Autocomplete
      items={results}
      filter={null}
      value={inputValue}
      onValueChange={onInputValueChange}
      itemToStringValue={(client: Client) => client.document}
    >
      <AutocompleteInput id={id} placeholder="Número de documento" inputMode="numeric" />
      <AutocompleteContent>
        <AutocompleteList>
          {(client: Client) => (
            <AutocompleteItem key={client.id} value={client} onClick={() => onSelectClient(client)}>
              <span className="font-mono">{client.document}</span>
              <span className="text-muted-foreground">{client.full_name}</span>
            </AutocompleteItem>
          )}
        </AutocompleteList>
        <AutocompleteEmpty>
          {!enabled
            ? `Escribe al menos ${MIN_QUERY_LENGTH} dígitos`
            : isFetching
              ? "Buscando..."
              : "Sin coincidencias — se registrará como cliente nuevo"}
        </AutocompleteEmpty>
      </AutocompleteContent>
    </Autocomplete>
  );
}
