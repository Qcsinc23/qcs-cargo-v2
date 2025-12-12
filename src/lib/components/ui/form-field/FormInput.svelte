<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import Input from '../input/input.svelte';
  import Label from '../label/label.svelte';
  import { cn } from '$lib/utils';
  import type { ComponentType } from 'svelte';

  // Props
  export let id: string;
  export let label: string;
  export let type: 'text' | 'email' | 'password' | 'tel' | 'number' = 'text';
  export let placeholder: string = '';
  export let value: string = '';
  export let error: string | undefined = undefined;
  export let required: boolean = false;
  export let disabled: boolean = false;
  export let icon: ComponentType | null = null;
  export let validateOnBlur: boolean = true;
  export let validateOnChange: boolean = false;
  export let validator: ((value: string) => string | undefined) | null = null;

  const dispatch = createEventDispatcher();
  let internalError: string | undefined = undefined;
  let touched: boolean = false;
  let inputElement: HTMLInputElement;

  // Display error if provided externally or from internal validation
  $: displayError = error || internalError;
  $: hasError = !!displayError;
  $: inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  function validate() {
    if (!validator) return;

    const validationError = validator(value);
    internalError = validationError;
    dispatch('validation', { valid: !validationError, error: validationError });
  }

  function handleBlur() {
    touched = true;
    if (validateOnBlur) {
      validate();
    }
    dispatch('blur');
  }

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;

    if (validateOnChange && touched) {
      validate();
    }

    dispatch('change', { value });
  }

  function handleKeydown(e: KeyboardEvent) {
    dispatch('keydown', e);
  }

  // Auto-focus on mount if specified
  onMount(() => {
    if (inputElement && inputElement.hasAttribute('autofocus')) {
      inputElement.focus();
    }
  });

  // Expose validate method
  export function validateInput() {
    validate();
  }

  // Expose focus method
  export function focus() {
    inputElement?.focus();
  }
</script>

<div class="space-y-2">
  <Label
    for={inputId}
    class={cn('text-sm font-medium', { 'text-destructive': hasError })}
  >
    {label}
    {#if required}
      <span class="text-destructive ml-1">*</span>
    {/if}
  </Label>

  <div class="relative">
    {#if icon}
      <icon
        class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors"
        class:text-muted-foreground={hasError ? 'text-destructive' : ''}
      />
    {/if}

    <Input
      bind:this={inputElement}
      {id}
      {type}
      {placeholder}
      bind:value
      {disabled}
      {required}
      class={cn(
        'transition-colors',
        { 'pl-10': icon },
        {
          'border-destructive focus:border-destructive focus:ring-destructive': hasError,
          'border-green-500 focus:border-green-500 focus:ring-green-500': !hasError && touched && value && validator
        }
      )}
      on:blur={handleBlur}
      on:change={handleChange}
      on:keydown={handleKeydown}
      aria-invalid={hasError}
      aria-describedby={hasError ? `${inputId}-error` : undefined}
    />
  </div>

  {#if displayError}
    <p id={`${inputId}-error`} class="text-sm text-destructive animate-fade-in">
      {displayError}
    </p>
  {/if}
</div>

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }
</style>