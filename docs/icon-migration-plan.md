# Icon Library Migration Plan

## Current Issue
lucide-svelte v0.561.0 uses legacy `$$props` syntax incompatible with Svelte 5 runes mode

## Migration Options

### Option 1: Wait for lucide-svelte Svelte 5 Support
- **Pros**: No code changes needed
- **Cons**: Unknown timeline, may block Svelte 5 features indefinitely
- **Status**: Monitor GitHub issues for updates

### Option 2: Switch to lucide-react + Compatibility Layer
- **Pros**: Actively maintained, Svelte 5 compatible
- **Cons**: Requires React compatibility layer
- **Effort**: Medium

### Option 3: Use Inline SVG Icons (Recommended)
- **Pros**: Full control, Svelte 5 compatible, no dependencies
- **Cons**: Manual icon management
- **Effort**: High initially, low maintenance

### Option 4: Use Alternative Svelte Icon Library
Research alternatives:
- **svelte-feather-icons**: Svelte 5 ready
- **svelte-iconify**: Universal icon solution
- **heroicons**: Official Svelte 5 support

## Implementation Strategy

### Phase 1: Immediate (This week)
1. Create icon component wrapper for inline SVGs
2. Migrate critical icons used in booking flow
3. Test with Svelte 5 runes enabled

### Phase 2: Short-term (Next 2 weeks)
1. Migrate all icons to new system
2. Remove lucide-svelte dependency
3. Enable runes globally
4. Test all components

### Phase 3: Long-term (Next month)
1. Optimize icon loading with tree-shaking
2. Add icon size variants
3. Implement icon theming support

## Critical Icons for Booking Flow
Based on booking page analysis:
- Package, Plane, Truck, Layers, Zap (service types)
- ArrowRight, ArrowLeft, Check, Plus, Trash2 (navigation)
- Scale, Ruler, DollarSign, User, MapPin (form fields)
- Calendar, CreditCard, AlertTriangle, HelpCircle (validation)

## Next Steps
1. Create base Icon.svelte component
2. Extract SVGs for critical icons
3. Update imports in booking page
4. Test with runes enabled