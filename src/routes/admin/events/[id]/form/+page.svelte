<script lang="ts">
  import * as Button from "$lib/components/ui/shadcn-svelte/button"
  import * as Card from "$lib/components/ui/shadcn-svelte/card"
  import * as Select from "$lib/components/ui/shadcn-svelte/select"
  import { Input } from "$lib/components/ui/shadcn-svelte/input"
  import { Textarea } from "$lib/components/ui/shadcn-svelte/textarea"
  import { Label } from "$lib/components/ui/shadcn-svelte/label"
  import { Switch } from "$lib/components/ui/shadcn-svelte/switch"
  import { Separator } from "$lib/components/ui/shadcn-svelte/separator"
  import { enhance } from "$app/forms"

  let { data } = $props()

  let editingPartId = $state<string | null>(null)
  let editingFieldId = $state<string | null>(null)
  let addingFieldToPartId = $state<string | null>(null)
  let addingOptionToFieldId = $state<string | null>(null)

  const fieldTypes = [
    { value: "text", label: "Text" },
    { value: "textarea", label: "Text Area" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
    { value: "checkbox", label: "Checkbox" },
    { value: "select", label: "Dropdown" },
    { value: "radio", label: "Radio" },
    { value: "hidden", label: "Hidden" }
  ]

  const conditionTypes = [
    { value: "none", label: "Always show" },
    { value: "field_value", label: "Based on field value" },
    { value: "date_range", label: "Based on date/time" },
    { value: "registration_count", label: "Based on registration count" }
  ]
</script>

<div class="flex items-center justify-between mb-6">
  <div>
    <h1 class="text-3xl font-bold">Form Builder</h1>
    <p class="text-muted-foreground mt-1">
      {data.event.name} &mdash; {data.form.name}
    </p>
  </div>
  <div class="flex gap-2">
    <Button.Root variant="outline" href="/admin/events/{data.event.id}">← Back to Event</Button.Root>
    {#if data.event.isPublished}
      <Button.Root variant="outline" href="/events/{data.event.slug}/register">Preview Form</Button.Root>
    {/if}
  </div>
</div>

<!-- Add Part Form -->
<Card.Root class="mb-6">
  <Card.Header>
    <Card.Title>Add Form Part</Card.Title>
    <Card.Description>Form parts are displayed as separate steps/sections in the registration form</Card.Description>
  </Card.Header>
  <Card.Content>
    <form method="POST" action="?/addPart" use:enhance class="flex gap-4 items-end">
      <input type="hidden" name="formId" value={data.form.id} />
      <div class="flex-1 space-y-2">
        <Label for="partTitle">Title</Label>
        <Input id="partTitle" name="title" required placeholder="e.g. Personal Information, Preferences..." />
      </div>
      <div class="flex-1 space-y-2">
        <Label for="partDesc">Description</Label>
        <Input id="partDesc" name="description" placeholder="Optional description" />
      </div>
      <div class="w-24 space-y-2">
        <Label for="partOrder">Order</Label>
        <Input id="partOrder" name="sortOrder" type="number" value={data.parts.length} />
      </div>
      <Button.Root type="submit">Add Part</Button.Root>
    </form>
  </Card.Content>
</Card.Root>

<!-- Parts List -->
{#each data.parts as part, partIndex}
  <Card.Root class="mb-6">
    <Card.Header>
      <div class="flex items-center justify-between">
        <div>
          <Card.Title class="flex items-center gap-2">
            <span class="text-muted-foreground text-sm">#{partIndex + 1}</span>
            {part.title}
            {#if part.conditionType !== "none"}
              <span class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                Conditional
              </span>
            {/if}
          </Card.Title>
          {#if part.description}
            <Card.Description>{part.description}</Card.Description>
          {/if}
        </div>
        <div class="flex gap-2">
          <Button.Root
            variant="outline"
            size="sm"
            onclick={() => {
              editingPartId = editingPartId === part.id ? null : part.id
            }}
          >
            {editingPartId === part.id ? "Close" : "Edit"}
          </Button.Root>
          <form method="POST" action="?/deletePart" use:enhance>
            <input type="hidden" name="partId" value={part.id} />
            <Button.Root type="submit" variant="destructive" size="sm">Delete</Button.Root>
          </form>
        </div>
      </div>
    </Card.Header>

    {#if editingPartId === part.id}
      <Card.Content>
        <form method="POST" action="?/updatePart" use:enhance class="space-y-4">
          <input type="hidden" name="partId" value={part.id} />

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Title</Label>
              <Input name="title" value={part.title} required />
            </div>
            <div class="space-y-2">
              <Label>Description</Label>
              <Input name="description" value={part.description ?? ""} />
            </div>
          </div>

          <div class="space-y-2">
            <Label>Order</Label>
            <Input name="sortOrder" type="number" value={part.sortOrder} />
          </div>

          <Separator />

          <div class="space-y-4">
            <h4 class="font-medium">Visibility Condition</h4>
            <div class="space-y-2">
              <Label>Condition Type</Label>
              <select name="conditionType" class="w-full rounded-md border bg-background px-3 py-2" value={part.conditionType}>
                {#each conditionTypes as ct}
                  <option value={ct.value}>{ct.label}</option>
                {/each}
              </select>
            </div>

            {#if part.conditionType === "field_value"}
              <div class="grid grid-cols-3 gap-4">
                <div class="space-y-2">
                  <Label>Field</Label>
                  <select name="conditionFieldId" class="w-full rounded-md border bg-background px-3 py-2">
                    {#each data.allFields ?? [] as field}
                      <option value={field.id} selected={part.conditionConfig && 'fieldId' in part.conditionConfig && part.conditionConfig.fieldId === field.id}>
                        {field.label}
                      </option>
                    {/each}
                  </select>
                </div>
                <div class="space-y-2">
                  <Label>Operator</Label>
                  <select name="conditionOperator" class="w-full rounded-md border bg-background px-3 py-2">
                    <option value="equals">Equals</option>
                    <option value="not_equals">Not Equals</option>
                    <option value="contains">Contains</option>
                    <option value="in">In</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <Label>Value</Label>
                  <Input name="conditionValue" value={part.conditionConfig && 'value' in part.conditionConfig ? String(part.conditionConfig.value) : ""} />
                </div>
              </div>
            {:else if part.conditionType === "date_range"}
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label>Show After</Label>
                  <Input name="conditionAfter" type="datetime-local" value={part.conditionConfig && 'after' in part.conditionConfig ? String(part.conditionConfig.after ?? "") : ""} />
                </div>
                <div class="space-y-2">
                  <Label>Show Before</Label>
                  <Input name="conditionBefore" type="datetime-local" value={part.conditionConfig && 'before' in part.conditionConfig ? String(part.conditionConfig.before ?? "") : ""} />
                </div>
              </div>
            {:else if part.conditionType === "registration_count"}
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label>Operator</Label>
                  <select name="conditionCountOperator" class="w-full rounded-md border bg-background px-3 py-2">
                    <option value="less_than">Less Than</option>
                    <option value="greater_than">Greater Than</option>
                    <option value="equals">Equals</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <Label>Count</Label>
                  <Input name="conditionCountValue" type="number" value={part.conditionConfig && 'value' in part.conditionConfig ? String(part.conditionConfig.value) : "0"} />
                </div>
              </div>
            {/if}
          </div>

          <Button.Root type="submit">Update Part</Button.Root>
        </form>
      </Card.Content>
      <Separator />
    {/if}

    <Card.Content>
      <!-- Fields List -->
      {#if part.fields.length === 0}
        <p class="text-muted-foreground text-sm py-4">No fields yet. Add a field below.</p>
      {:else}
        <div class="space-y-3">
          {#each part.fields as field, fieldIndex}
            <div class="rounded-md border p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">{field.type}</span>
                  <span class="font-medium">{field.label}</span>
                  {#if field.required}
                    <span class="text-xs text-red-500">Required</span>
                  {/if}
                  {#if field.description}
                    <span class="text-xs text-muted-foreground">{field.description}</span>
                  {/if}
                </div>
                <div class="flex gap-2">
                  <Button.Root
                    variant="outline"
                    size="sm"
                    onclick={() => {
                      editingFieldId = editingFieldId === field.id ? null : field.id
                    }}
                  >
                    {editingFieldId === field.id ? "Close" : "Edit"}
                  </Button.Root>
                  <form method="POST" action="?/deleteField" use:enhance>
                    <input type="hidden" name="fieldId" value={field.id} />
                    <Button.Root type="submit" variant="destructive" size="sm">Delete</Button.Root>
                  </form>
                </div>
              </div>

              {#if editingFieldId === field.id}
                <Separator class="my-4" />
                <form method="POST" action="?/updateField" use:enhance class="space-y-4">
                  <input type="hidden" name="fieldId" value={field.id} />
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <Label>Type</Label>
                      <select name="type" class="w-full rounded-md border bg-background px-3 py-2" value={field.type}>
                        {#each fieldTypes as ft}
                          <option value={ft.value}>{ft.label}</option>
                        {/each}
                      </select>
                    </div>
                    <div class="space-y-2">
                      <Label>Label</Label>
                      <Input name="label" value={field.label} required />
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <Label>Placeholder</Label>
                      <Input name="placeholder" value={field.placeholder ?? ""} />
                    </div>
                    <div class="space-y-2">
                      <Label>Default Value</Label>
                      <Input name="defaultValue" value={field.defaultValue ?? ""} />
                    </div>
                  </div>
                  <div class="space-y-2">
                    <Label>Description</Label>
                    <Input name="description" value={field.description ?? ""} />
                  </div>
                  <div class="flex items-center gap-2">
                    <Switch name="required" checked={field.required} />
                    <Label>Required</Label>
                  </div>
                  <Input name="sortOrder" type="hidden" value={String(field.sortOrder)} />
                  <Button.Root type="submit" size="sm">Update Field</Button.Root>
                </form>

                <!-- Options for select/radio -->
                {#if field.type === "select" || field.type === "radio"}
                  <Separator class="my-4" />
                  <div class="space-y-3">
                    <h5 class="text-sm font-medium">Options</h5>
                    {#each field.options as option}
                      <div class="flex items-center gap-2">
                        <span class="text-sm">{option.label}</span>
                        <span class="text-xs text-muted-foreground">({option.value})</span>
                        <form method="POST" action="?/deleteOption" use:enhance class="ml-auto">
                          <input type="hidden" name="fieldId" value={field.id} />
                          <input type="hidden" name="value" value={option.value} />
                          <Button.Root type="submit" variant="destructive" size="sm">Remove</Button.Root>
                        </form>
                      </div>
                    {/each}

                    <form method="POST" action="?/addOption" use:enhance class="flex gap-2 items-end">
                      <input type="hidden" name="fieldId" value={field.id} />
                      <div class="flex-1 space-y-1">
                        <Label>Label</Label>
                        <Input name="label" placeholder="Option label" required />
                      </div>
                      <div class="flex-1 space-y-1">
                        <Label>Value</Label>
                        <Input name="value" placeholder="Option value" required />
                      </div>
                      <Button.Root type="submit" size="sm">Add Option</Button.Root>
                    </form>
                  </div>
                {/if}
              {/if}
            </div>
          {/each}
        </div>
      {/if}

      <!-- Add Field Form -->
      <Separator class="my-4" />
      {#if addingFieldToPartId === part.id}
        <form method="POST" action="?/addField" use:enhance class="space-y-4">
          <input type="hidden" name="partId" value={part.id} />
          <h4 class="font-medium">Add Field</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Type</Label>
              <select name="type" class="w-full rounded-md border bg-background px-3 py-2" required>
                {#each fieldTypes as ft}
                  <option value={ft.value}>{ft.label}</option>
                {/each}
              </select>
            </div>
            <div class="space-y-2">
              <Label>Label</Label>
              <Input name="label" required placeholder="e.g. Full Name, Email Address..." />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Placeholder</Label>
              <Input name="placeholder" placeholder="Optional" />
            </div>
            <div class="space-y-2">
              <Label>Description</Label>
              <Input name="description" placeholder="Optional help text" />
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <Switch name="required" />
              <Label>Required</Label>
            </div>
            <Input name="sortOrder" type="hidden" value={String(part.fields.length)} />
          </div>
          <div class="flex gap-2">
            <Button.Root type="submit" size="sm">Add Field</Button.Root>
            <Button.Root type="button" variant="outline" size="sm" onclick={() => (addingFieldToPartId = null)}>Cancel</Button.Root>
          </div>
        </form>
      {:else}
        <Button.Root variant="outline" size="sm" onclick={() => (addingFieldToPartId = part.id)}>+ Add Field</Button.Root>
      {/if}
    </Card.Content>
  </Card.Root>
{/each}
