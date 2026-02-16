<script lang="ts">
  import * as Button from "$lib/components/ui/shadcn-svelte/button"
  import * as Card from "$lib/components/ui/shadcn-svelte/card"

  let { data } = $props()
</script>

<div class="mx-auto max-w-4xl px-4 py-8">
  <h1 class="text-4xl font-bold mb-8">Events</h1>

  {#if data.events.length === 0}
    <p class="text-center text-muted-foreground py-12">No events available at the moment.</p>
  {:else}
    <div class="grid gap-6 md:grid-cols-2">
      {#each data.events as event}
        <Card.Root>
          <Card.Header>
            <Card.Title>{event.name}</Card.Title>
            {#if event.description}
              <Card.Description>{event.description}</Card.Description>
            {/if}
          </Card.Header>
          <Card.Content>
            <div class="space-y-2 text-sm text-muted-foreground">
              {#if event.startDate}
                <p>📅 {new Date(event.startDate).toLocaleDateString(undefined, { dateStyle: "long" })}</p>
              {/if}
              {#if event.maxRegistrations}
                <p>👥 Max {event.maxRegistrations} registrations</p>
              {/if}
            </div>
          </Card.Content>
          <Card.Footer>
            <Button.Root href="/events/{event.slug}/register" class="w-full">Register</Button.Root>
          </Card.Footer>
        </Card.Root>
      {/each}
    </div>
  {/if}
</div>
