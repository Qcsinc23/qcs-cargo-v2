<script lang="ts">
  import { cn } from '$lib/utils';
  import { onDestroy, onMount } from 'svelte';
  import type { NumberInputOptions, NumberInputValue } from 'intl-number-input';
  import type { HTMLInputAttributes } from 'svelte/elements';
  
  // Dynamic import to ensure module loads correctly
  let NumberInputClass: typeof import('intl-number-input').NumberInput | null = null;

  /**
   * NOTE: We intentionally use `intl-number-input` directly here.
   *
   * `svelte-number-format` v1.1.0's `NumericFormat` uses `$effect` in a way that
   * triggers a Svelte runtime "effect_update_depth_exceeded" loop in this app.
   * (We still use `svelte-number-format`'s `PatternFormat` for phone masking.)
   */
  type $$Props = Omit<HTMLInputAttributes, 'value'> & {
    value?: number | null;
    locale?: string;
    options?: Partial<NumberInputOptions>;
    onInput?: (raw: number | null, formatted: string | null) => void;
    onChange?: (raw: number | null, formatted: string | null) => void;
  };

  let className: $$Props['class'] = undefined;

  export let value: number | null = null;
  export let locale: string | undefined = undefined;
  export let options: Partial<NumberInputOptions> = {};
  export let onInput: $$Props['onInput'] = undefined;
  export let onChange: $$Props['onChange'] = undefined;

  export { className as class };

  let inputEl: HTMLInputElement | null = null;
  let numberInput: any = null; // NumberInput instance (type from intl-number-input)
  let isFocused = false;

  const getMergedOptions = (): NumberInputOptions => ({
    // Keep parity with svelte-number-format:
    // `locale` is merged, but can be overridden by `options.locale` if provided.
    locale,
    ...options
  });

  function handleNumberInput(val: NumberInputValue) {
    const raw = val.number ?? null;
    const formatted = val.formatted ?? null;

    if (!Object.is(value, raw)) value = raw;
    onInput?.(raw, formatted);
  }

  function handleNumberChange(val: NumberInputValue) {
    const raw = val.number ?? null;
    const formatted = val.formatted ?? null;

    if (!Object.is(value, raw)) value = raw;
    onChange?.(raw, formatted);
  }

  function syncExternalValueToInput() {
    if (!numberInput) return;
    if (isFocused) return;

    const current = numberInput.getValue().number ?? null;
    const next = value ?? null;
    if (!Object.is(current, next)) {
      numberInput.setValue(next);
    }
  }

  function syncOptionsToInput() {
    if (!numberInput) return;
    numberInput.setOptions(getMergedOptions());
  }

  onMount(async () => {
    if (!inputEl) return;
    
    // Dynamic import to ensure module loads
    if (!NumberInputClass) {
      try {
        const module = await import('intl-number-input');
        NumberInputClass = module.NumberInput;
      } catch (err) {
        console.error('[NumericInput] Failed to import intl-number-input:', err);
        return;
      }
    }
    
    if (!NumberInputClass) {
      console.error('[NumericInput] NumberInput constructor is not available.');
      return;
    }

    try {
      numberInput = new NumberInputClass({
        el: inputEl,
        options: getMergedOptions(),
        onInput: handleNumberInput,
        onChange: handleNumberChange
      });
    } catch (err) {
      console.error('[NumericInput] Failed to initialize:', err);
      return;
    }

    if (value != null) {
      numberInput.setValue(value);
    }

    const handleFocus = () => {
      isFocused = true;
    };
    const handleBlur = () => {
      isFocused = false;
      // Ensure the bound value is synced after blur/formatting.
      try {
        const cur = numberInput?.getValue?.();
        const raw = cur?.number ?? null;
        if (!Object.is(value, raw)) value = raw;
      } catch {
        // no-op
      }
    };

    inputEl.addEventListener('focus', handleFocus);
    inputEl.addEventListener('blur', handleBlur);

    return () => {
      inputEl?.removeEventListener('focus', handleFocus);
      inputEl?.removeEventListener('blur', handleBlur);
      numberInput?.destroy?.();
      numberInput = null;
    };
  });

  onDestroy(() => {
    numberInput?.destroy?.();
    numberInput = null;
  });

  // Keep options in sync (rare, but safe)
  $: if (numberInput) syncOptionsToInput();

  // Keep external `value` in sync when not focused
  $: syncExternalValueToInput();
</script>

<input
  bind:this={inputEl}
  class={cn(
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    className
  )}
  {...$$restProps}
/>


