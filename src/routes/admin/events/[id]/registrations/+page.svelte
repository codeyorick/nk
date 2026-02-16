<script lang="ts">
  import * as Button from "$lib/components/ui/shadcn-svelte/button"
  import * as Card from "$lib/components/ui/shadcn-svelte/card"
  import * as Table from "$lib/components/ui/shadcn-svelte/table"
  import { enhance } from "$app/forms"

  let { data } = $props()

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    confirmed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    waitlisted: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
  }

  let expandedId = $state<string | null>(null)
</script>

<div class="flex items-center justify-between mb-6">
  <div>
    <h1 class="text-3xl font-bold">Registrations</h1>
    <p class="text-muted-foreground mt-1">{data.event.name} &mdash; {data.registrations.length} registration(s)</p>
  </div>
  <Button.Root variant="outline" href="/admin/events/{data.event.id}">← Back to Event</Button.Root>
</div>

{#if data.registrations.length === 0}
  <Card.Root>
    <Card.Content class="py-12 text-center text-muted-foreground">
      <p class="text-lg">No registrations yet</p>
    </Card.Content>
  </Card.Root>
{:else}
  <Table.Root>
    <Table.Header>
      <Table.Row>
        <Table.Head>Email</Table.Head>
        <Table.Head>Status</Table.Head>
        <Table.Head>Registered</Table.Head>
        <Table.Head>Confirmed</Table.Head>
        <Table.Head class="text-right">Actions</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each data.registrations as reg}
        <Table.Row class="cursor-pointer" onclick={() => (expandedId = expandedId === reg.id ? null : reg.id)}>
          <Table.Cell class="font-medium">{reg.email}</Table.Cell>
          <Table.Cell>
            <span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium {statusColors[reg.status]}">
              {reg.status}
            </span>
          </Table.Cell>
          <Table.Cell>{new Date(reg.createdAt).toLocaleString()}</Table.Cell>
          <Table.Cell>{reg.confirmedAt ? new Date(reg.confirmedAt).toLocaleString() : "—"}</Table.Cell>
          <Table.Cell class="text-right">
            <div class="flex items-center justify-end gap-1">
              {#if reg.status !== "confirmed"}
                <form method="POST" action="?/updateStatus" use:enhance>
                  <input type="hidden" name="registrationId" value={reg.id} />
                  <input type="hidden" name="status" value="confirmed" />
                  <Button.Root type="submit" variant="outline" size="sm">Confirm</Button.Root>
                </form>
              {/if}
              {#if reg.status !== "cancelled"}
                <form method="POST" action="?/updateStatus" use:enhance>
                  <input type="hidden" name="registrationId" value={reg.id} />
                  <input type="hidden" name="status" value="cancelled" />
                  <Button.Root type="submit" variant="destructive" size="sm">Cancel</Button.Root>
                </form>
              {/if}
            </div>
          </Table.Cell>
        </Table.Row>
        {#if expandedId === reg.id}
          <Table.Row>
            <Table.Cell colspan={5}>
              <div class="bg-muted/50 rounded-md p-4">
                <h4 class="font-medium mb-3">Registration Data</h4>
                <dl class="grid grid-cols-2 gap-2">
                  {#each reg.data as field}
                    <div>
                      <dt class="text-sm text-muted-foreground">{field.fieldLabel}</dt>
                      <dd class="font-medium">{field.value}</dd>
                    </div>
                  {/each}
                </dl>
              </div>
            </Table.Cell>
          </Table.Row>
        {/if}
      {/each}
    </Table.Body>
  </Table.Root>
{/if}
