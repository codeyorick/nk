<script lang="ts">
  import * as Button from "$lib/components/ui/shadcn-svelte/button"
  import * as Card from "$lib/components/ui/shadcn-svelte/card"
  import { Input } from "$lib/components/ui/shadcn-svelte/input"
  import { Textarea } from "$lib/components/ui/shadcn-svelte/textarea"
  import { Label } from "$lib/components/ui/shadcn-svelte/label"
  import { Checkbox } from "$lib/components/ui/shadcn-svelte/checkbox"
  import { enhance } from "$app/forms"
  import { page } from "$app/state"

  let { data, form } = $props()

  const success = page.url.searchParams.get("success") === "true"

  // Multi-step state
  let currentStep = $state(0)
  let fieldValues = $state<Record<string, string>>({})

  // Evaluate conditions for parts to determine visible steps
  function isPartVisible(part: (typeof data.parts)[number]): boolean {
    if (part.conditionType === "none" || !part.conditionConfig) return true

    const config = part.conditionConfig as Record<string, unknown>

    if (part.conditionType === "field_value" && "fieldId" in config) {
      const fieldId = config.fieldId as string
      const operator = config.operator as string
      const targetValue = String(config.value ?? "")

      const currentValue = fieldValues[fieldId] ?? ""

      switch (operator) {
        case "equals":
          return currentValue === targetValue
        case "not_equals":
          return currentValue !== targetValue
        case "contains":
          return currentValue.includes(targetValue)
        case "in":
          return targetValue
            .split(",")
            .map(v => v.trim())
            .includes(currentValue)
        default:
          return false
      }
    }

    if (part.conditionType === "date_range") {
      const now = new Date()
      if ("after" in config && config.after && now < new Date(config.after as string)) return false
      if ("before" in config && config.before && now > new Date(config.before as string)) return false
      return true
    }

    if (part.conditionType === "registration_count" && "operator" in config) {
      const op = config.operator as string
      const val = config.value as number
      const count = data.registrationCount

      switch (op) {
        case "less_than":
          return count < val
        case "greater_than":
          return count > val
        case "equals":
          return count === val
        default:
          return false
      }
    }

    return true
  }

  let visibleParts = $derived(data.parts.filter(isPartVisible))
  let currentPart = $derived(visibleParts[currentStep])
  let isLastStep = $derived(currentStep >= visibleParts.length - 1)

  // Find email field value
  let emailValue = $derived.by(() => {
    for (const part of data.parts) {
      for (const field of part.fields) {
        if (field.type === "email") {
          return fieldValues[field.id] ?? ""
        }
      }
    }
    return ""
  })
</script>

<div class="mx-auto max-w-2xl px-4 py-8">
  {#if success}
    <Card.Root>
      <Card.Header>
        <Card.Title class="text-green-600">Registration Submitted!</Card.Title>
      </Card.Header>
      <Card.Content>
        <p class="text-muted-foreground">
          Thank you for registering for <strong>{data.event.name}</strong>. We've sent a confirmation email.
          Please check your inbox and click the confirmation link to complete your registration.
        </p>
      </Card.Content>
      <Card.Footer>
        <Button.Root href="/events" variant="outline">← Back to Events</Button.Root>
      </Card.Footer>
    </Card.Root>
  {:else}
    <div class="mb-6">
      <h1 class="text-3xl font-bold">{data.event.name}</h1>
      {#if data.event.description}
        <p class="text-muted-foreground mt-2">{data.event.description}</p>
      {/if}
      {#if data.event.maxRegistrations}
        <p class="text-sm text-muted-foreground mt-1">
          {data.registrationCount} / {data.event.maxRegistrations} spots taken
        </p>
      {/if}
    </div>

    {#if form?.error}
      <div class="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300">
        {form.error}
      </div>
    {/if}

    <!-- Step indicator -->
    {#if visibleParts.length > 1}
      <div class="flex items-center gap-2 mb-6">
        {#each visibleParts as part, i}
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center transition-colors
                {i === currentStep
                ? 'bg-primary text-primary-foreground'
                : i < currentStep
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-muted text-muted-foreground'}"
              onclick={() => {
                if (i < currentStep) currentStep = i
              }}
            >
              {i + 1}
            </button>
            <span class="text-sm {i === currentStep ? 'font-medium' : 'text-muted-foreground'}">
              {part.title}
            </span>
            {#if i < visibleParts.length - 1}
              <div class="w-8 h-px bg-border"></div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    <!-- Multi-step or single form -->
    {#if visibleParts.length === 0}
      <Card.Root>
        <Card.Content class="py-12 text-center text-muted-foreground">
          <p>No registration form is available for this event.</p>
        </Card.Content>
      </Card.Root>
    {:else if isLastStep}
      <!-- Final step: submit the full form -->
      <form method="POST" use:enhance>
        <!-- Hidden fields with all collected values -->
        <input type="hidden" name="_email" value={emailValue} />
        {#each Object.entries(fieldValues) as [fieldId, value]}
          <input type="hidden" name="field_{fieldId}" value={value} />
        {/each}

        <Card.Root>
          <Card.Header>
            <Card.Title>{currentPart.title}</Card.Title>
            {#if currentPart.description}
              <Card.Description>{currentPart.description}</Card.Description>
            {/if}
          </Card.Header>
          <Card.Content class="space-y-4">
            {#each currentPart.fields as field}
              <div class="space-y-2">
                <Label for="field_{field.id}">
                  {field.label}
                  {#if field.required}<span class="text-red-500">*</span>{/if}
                </Label>
                {#if field.description}
                  <p class="text-xs text-muted-foreground">{field.description}</p>
                {/if}

                {#if field.type === "text" || field.type === "email" || field.type === "phone" || field.type === "number" || field.type === "date"}
                  <Input
                    id="field_{field.id}"
                    name="field_{field.id}"
                    type={field.type === "phone" ? "tel" : field.type}
                    placeholder={field.placeholder ?? ""}
                    required={field.required}
                    value={fieldValues[field.id] ?? field.defaultValue ?? ""}
                    oninput={(e) => { fieldValues[field.id] = (e.target as HTMLInputElement).value }}
                  />
                {:else if field.type === "textarea"}
                  <Textarea
                    id="field_{field.id}"
                    name="field_{field.id}"
                    placeholder={field.placeholder ?? ""}
                    required={field.required}
                    value={fieldValues[field.id] ?? field.defaultValue ?? ""}
                    oninput={(e) => { fieldValues[field.id] = (e.target as HTMLTextAreaElement).value }}
                  />
                {:else if field.type === "checkbox"}
                  <div class="flex items-center gap-2">
                    <Checkbox
                      id="field_{field.id}"
                      name="field_{field.id}"
                      checked={fieldValues[field.id] === "true"}
                      onCheckedChange={(checked) => { fieldValues[field.id] = String(checked) }}
                    />
                  </div>
                {:else if field.type === "select"}
                  <select
                    id="field_{field.id}"
                    name="field_{field.id}"
                    class="w-full rounded-md border bg-background px-3 py-2"
                    required={field.required}
                    value={fieldValues[field.id] ?? field.defaultValue ?? ""}
                    onchange={(e) => { fieldValues[field.id] = (e.target as HTMLSelectElement).value }}
                  >
                    <option value="">Select...</option>
                    {#each field.options ?? [] as option}
                      <option value={option.value}>{option.label}</option>
                    {/each}
                  </select>
                {:else if field.type === "radio"}
                  <div class="space-y-2">
                    {#each field.options ?? [] as option}
                      <label class="flex items-center gap-2">
                        <input
                          type="radio"
                          name="field_{field.id}"
                          value={option.value}
                          checked={fieldValues[field.id] === option.value}
                          onchange={() => { fieldValues[field.id] = option.value }}
                          class="text-primary"
                        />
                        {option.label}
                      </label>
                    {/each}
                  </div>
                {/if}

                {#if form?.fieldErrors?.[field.id]}
                  <p class="text-sm text-destructive">{form.fieldErrors[field.id]}</p>
                {/if}
              </div>
            {/each}
          </Card.Content>
          <Card.Footer class="flex justify-between">
            {#if currentStep > 0}
              <Button.Root type="button" variant="outline" onclick={() => currentStep--}>
                ← Previous
              </Button.Root>
            {:else}
              <div></div>
            {/if}
            <Button.Root type="submit">Submit Registration</Button.Root>
          </Card.Footer>
        </Card.Root>
      </form>
    {:else}
      <!-- Non-final step: just collect values -->
      <Card.Root>
        <Card.Header>
          <Card.Title>{currentPart.title}</Card.Title>
          {#if currentPart.description}
            <Card.Description>{currentPart.description}</Card.Description>
          {/if}
        </Card.Header>
        <Card.Content class="space-y-4">
          {#each currentPart.fields as field}
            <div class="space-y-2">
              <Label for="field_{field.id}">
                {field.label}
                {#if field.required}<span class="text-red-500">*</span>{/if}
              </Label>
              {#if field.description}
                <p class="text-xs text-muted-foreground">{field.description}</p>
              {/if}

              {#if field.type === "text" || field.type === "email" || field.type === "phone" || field.type === "number" || field.type === "date"}
                <Input
                  id="field_{field.id}"
                  type={field.type === "phone" ? "tel" : field.type}
                  placeholder={field.placeholder ?? ""}
                  required={field.required}
                  value={fieldValues[field.id] ?? field.defaultValue ?? ""}
                  oninput={(e) => { fieldValues[field.id] = (e.target as HTMLInputElement).value }}
                />
              {:else if field.type === "textarea"}
                <Textarea
                  id="field_{field.id}"
                  placeholder={field.placeholder ?? ""}
                  required={field.required}
                  value={fieldValues[field.id] ?? field.defaultValue ?? ""}
                  oninput={(e) => { fieldValues[field.id] = (e.target as HTMLTextAreaElement).value }}
                />
              {:else if field.type === "checkbox"}
                <div class="flex items-center gap-2">
                  <Checkbox
                    id="field_{field.id}"
                    checked={fieldValues[field.id] === "true"}
                    onCheckedChange={(checked) => { fieldValues[field.id] = String(checked) }}
                  />
                </div>
              {:else if field.type === "select"}
                <select
                  id="field_{field.id}"
                  class="w-full rounded-md border bg-background px-3 py-2"
                  required={field.required}
                  value={fieldValues[field.id] ?? field.defaultValue ?? ""}
                  onchange={(e) => { fieldValues[field.id] = (e.target as HTMLSelectElement).value }}
                >
                  <option value="">Select...</option>
                  {#each field.options ?? [] as option}
                    <option value={option.value}>{option.label}</option>
                  {/each}
                </select>
              {:else if field.type === "radio"}
                <div class="space-y-2">
                  {#each field.options ?? [] as option}
                    <label class="flex items-center gap-2">
                      <input
                        type="radio"
                        name="field_{field.id}"
                        value={option.value}
                        checked={fieldValues[field.id] === option.value}
                        onchange={() => { fieldValues[field.id] = option.value }}
                        class="text-primary"
                      />
                      {option.label}
                    </label>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
        </Card.Content>
        <Card.Footer class="flex justify-between">
          {#if currentStep > 0}
            <Button.Root type="button" variant="outline" onclick={() => currentStep--}>
              ← Previous
            </Button.Root>
          {:else}
            <div></div>
          {/if}
          <Button.Root type="button" onclick={() => currentStep++}>
            Next →
          </Button.Root>
        </Card.Footer>
      </Card.Root>
    {/if}
  {/if}
</div>
