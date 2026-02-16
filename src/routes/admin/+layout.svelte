<script lang="ts">
  let { children } = $props()
</script>

<div class="min-h-screen bg-background">
  <nav class="border-b bg-card">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <div class="flex items-center gap-6">
          <a href="/admin" class="text-xl font-bold">Event Admin</a>
          <div class="flex items-center gap-4">
            <a href="/admin/events" class="text-sm text-muted-foreground hover:text-foreground">Events</a>
          </div>
        </div>
        <div>
          <a href="/" class="text-sm text-muted-foreground hover:text-foreground">← Back to site</a>
        </div>
      </div>
    </div>
  </nav>
  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    {@render children()}
  </main>
</div>
