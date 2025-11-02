# Wave 1 Creator Onboarding System

Complete multi-step onboarding flow for creating Wave 1 creator accounts with profile setup, workspace creation, team invitations, wallet connection, and skills selection.

## Components

### Layout & Structure

#### OnboardingLayout
Main layout component that provides consistent styling and progress tracking across all onboarding steps.

```tsx
<OnboardingLayout
  title="Complete Your Profile"
  subtitle="Tell us about yourself"
  step={2}
  progress={33}
  completedSteps={['email_verification']}
  onBack={() => handleBack()}
>
  {/* Form content */}
</OnboardingLayout>
```

**Props:**
- `title: string` - Page title
- `subtitle?: string` - Page subtitle
- `step: number` - Current step (1-6)
- `progress: number` - Progress percentage (0-100)
- `completedSteps: string[]` - Array of completed step keys
- `onBack?: () => void` - Back button handler
- `showProgress?: boolean` - Show/hide progress bar (default: true)

---

#### ProgressBar
Multi-step progress indicator showing completed steps, current step, and overall progress.

```tsx
<ProgressBar
  currentStep={2}
  completedSteps={['email_verification']}
  progress={33}
/>
```

**Props:**
- `currentStep: number` - Current step number (1-6)
- `completedSteps: string[]` - Array of completed step keys
- `progress: number` - Overall progress percentage

---

### Forms

#### EmailVerificationForm
6-digit email code verification with resend countdown and error handling.

```tsx
<EmailVerificationForm
  email="user@example.com"
  onSuccess={() => {/* Next step */}}
  onBack={() => {/* Previous step */}}
/>
```

**Props:**
- `email: string` - Email address to verify
- `onSuccess: () => void` - Callback when verification succeeds
- `onBack?: () => void` - Back button handler

**Features:**
- Auto-formatted 6-digit code input
- Resend code with countdown timer
- Rate limiting detection
- Comprehensive error messages

---

#### ProfileForm
Creator profile setup with username, bio, and availability checking.

```tsx
<ProfileForm
  userId={userId}
  initialData={{ username: 'john-doe', bio: 'Designer & developer' }}
  onSuccess={() => {/* Next step */}}
  onSkip={() => {/* Skip to next step */}}
/>
```

**Props:**
- `userId: Id<'entities'>` - User ID from signup
- `initialData?: { username?, bio?, avatar? }` - Pre-filled data
- `onSuccess: () => void` - Save and continue
- `onSkip?: () => void` - Skip this step

**Features:**
- Real-time username availability checking (debounced)
- Bio character counter (max 500)
- Input validation with error messages
- Lowercase username enforcement

---

#### WorkspaceForm
Workspace creation with auto-generated slug validation.

```tsx
<WorkspaceForm
  userId={userId}
  onSuccess={() => {/* Next step */}}
  onSkip={() => {/* Skip to next step */}}
/>
```

**Props:**
- `userId: Id<'entities'>` - User ID
- `onSuccess: () => void` - Workspace created
- `onSkip?: () => void` - Skip this step

**Features:**
- Auto-generate slug from name (debounced)
- Real-time slug availability checking
- Editable slug with validation
- Description field (optional, max 500 chars)

---

#### TeamInviteForm
Send team member invitations with role assignment.

```tsx
<TeamInviteForm
  userId={userId}
  workspaceId={workspaceId}
  onSuccess={() => {/* Next step */}}
  onSkip={() => {/* Skip to next step */}}
/>
```

**Props:**
- `userId: Id<'entities'>` - Workspace owner ID
- `workspaceId: Id<'groups'>` - Workspace ID
- `onSuccess: () => void` - Invitations sent
- `onSkip?: () => void` - Skip this step

**Features:**
- Email validation
- Role selection (editor/viewer)
- Pending invitations list
- Rate limiting with countdown
- Remove pending invitations

---

#### TeamMembersList
Display team members and pending invitations with status.

```tsx
<TeamMembersList
  members={[
    { id: '1', email: 'john@example.com', role: 'editor', status: 'accepted' }
  ]}
  owner={{ id: '0', email: 'you@example.com', role: 'owner', status: 'accepted' }}
  onRemove={(memberId) => {/* Remove member */}}
/>
```

**Props:**
- `members: TeamMember[]` - Array of team members
- `owner?: TeamMember` - Owner member object
- `onRemove?: (memberId: string) => void` - Remove handler
- `loading?: boolean` - Loading state

---

#### WalletConnector
Ethereum wallet connection with MetaMask and manual entry support.

```tsx
<WalletConnector
  userId={userId}
  connectedWallet="0x123..."
  onSuccess={() => {/* Next step */}}
  onSkip={() => {/* Skip to next step */}}
/>
```

**Props:**
- `userId: Id<'entities'>` - User ID
- `connectedWallet?: string` - Pre-connected wallet address
- `onSuccess: () => void` - Wallet connected
- `onSkip?: () => void` - Skip this step

**Features:**
- MetaMask auto-detection
- WalletConnect support
- Manual address entry
- Chain selection (Ethereum, Polygon, etc.)
- Address validation
- Disconnect button

---

#### SkillsSelector
Multi-select skills with suggested options and custom input.

```tsx
<SkillsSelector
  userId={userId}
  onSuccess={() => {/* Complete */}}
  onSkip={() => {/* Skip */}}
/>
```

**Props:**
- `userId: Id<'entities'>` - User ID
- `onSuccess: () => void` - Skills saved (completes onboarding)
- `onSkip?: () => void` - Skip this step

**Features:**
- 50+ suggested skills
- Category selection
- Search/filter suggestions
- Custom skill input
- Max 50 skills limit
- Click to remove selected skills

---

#### OnboardingCompleted
Success screen after completing all steps.

```tsx
<OnboardingCompleted
  userId={userId}
  workspaceName="My Workspace"
/>
```

**Props:**
- `userId: Id<'entities'>` - User ID
- `workspaceName?: string` - Workspace name to display

---

### Multi-Step Controller

#### SignUpOnboarding
Complete onboarding flow controller managing all steps and state.

```tsx
import { SignUpOnboarding } from '@/components/onboarding/SignUpOnboarding';

export default function OnboardPage() {
  return <SignUpOnboarding client:load />;
}
```

**Features:**
- Manages all 6 onboarding steps
- State persistence
- Step transitions with fade animation
- Progress tracking
- Back navigation
- Error handling

---

## Hooks

### useSignupOnboarding
Create new account with email/password.

```tsx
const { mutate: signup, loading, error } = useSignupOnboarding();

await signup({
  email: 'user@example.com',
  password: 'SecurePass123',
  displayName: 'John Doe',
  agreeToTerms: true,
  agreeToPrivacy: true,
});
```

---

### useVerifyEmailOnboarding
Verify email with 6-digit code.

```tsx
const { mutate: verify, loading, error } = useVerifyEmailOnboarding();

await verify({
  email: 'user@example.com',
  code: '123456',
});
```

---

### useResendVerificationCode
Request new verification code.

```tsx
const { mutate: resend, loading, nextRetryAt } = useResendVerificationCode();

await resend('user@example.com');

// nextRetryAt: timestamp when user can resend again
```

---

### useUpdateProfile
Update creator profile information.

```tsx
const { mutate: updateProfile, loading } = useUpdateProfile();

await updateProfile({
  userId,
  username: 'john-doe',
  bio: 'Designer & developer',
});
```

---

### useCreateWorkspace
Create first workspace.

```tsx
const { mutate: createWorkspace, loading } = useCreateWorkspace();

await createWorkspace({
  userId,
  name: 'My Workspace',
  slug: 'my-workspace',
  description: 'My creative workspace',
});
```

---

### useInviteTeamMember
Send team member invitation.

```tsx
const { mutate: inviteTeamMember, loading, nextRetryAt } = useInviteTeamMember();

await inviteTeamMember({
  userId,
  workspaceId,
  invitedEmail: 'colleague@example.com',
  role: 'editor',
});
```

---

### useConnectWallet
Connect Ethereum wallet.

```tsx
const { mutate: connectWallet, loading } = useConnectWallet();

await connectWallet({
  userId,
  walletAddress: '0x123...',
  chainId: 1,
  walletType: 'metamask',
});
```

---

### useAddSkills
Add skills to profile (completes onboarding).

```tsx
const { mutate: addSkills, loading } = useAddSkills();

await addSkills({
  userId,
  skills: ['React', 'TypeScript', 'UI Design'],
  category: 'technical',
});
```

---

### useCheckUsernameAvailable
Check if username is available.

```tsx
const { check, loading } = useCheckUsernameAvailable();

const available = await check('john-doe');
// Returns: boolean | null
```

---

### useCheckWorkspaceSlugAvailable
Check if workspace slug is available.

```tsx
const { check, loading } = useCheckWorkspaceSlugAvailable();

const available = await check('my-workspace');
// Returns: boolean | null
```

---

### useOnboardingStatus
Get current onboarding status and progress.

```tsx
const { status, loading, error, refetch } = useOnboardingStatus(userId);

// status.currentStep: 'profile' | 'workspace' | ...
// status.progress: 33
// status.steps: { emailVerified: true, profileComplete: false, ... }
```

---

## Pages

### /onboard
Main onboarding entry point. Shows complete multi-step flow.

```
/onboard → SignUpOnboarding (all steps in one flow)
```

---

### /onboard/signup
Individual signup page (legacy, redirects to /onboard).

---

## Onboarding Flow

```
1. Signup (Create Account)
   └─ Email verification code sent
   ↓
2. Email Verification
   └─ Verify 6-digit code
   ↓
3. Profile (Complete Profile)
   └─ Username, bio (optional)
   ↓
4. Workspace (Create Workspace)
   └─ Name, slug, description
   ↓
5. Team (Invite Team Members)
   └─ Email invitations with roles (optional)
   ↓
6. Wallet (Connect Wallet)
   └─ MetaMask or manual entry (optional)
   ↓
7. Skills (Add Skills)
   └─ Select expertise and skills
   ↓
Complete! → Dashboard
```

---

## Error Handling

All forms include comprehensive error handling:

```tsx
try {
  await mutation({...});
} catch (err) {
  // Backend returns:
  // 1. Field-level errors: { success: false, errors: { fieldName: "error" } }
  // 2. Single error: { success: false, error: "error message" }
  // 3. Rate limit: error message includes retry time
}
```

---

## Accessibility

- Semantic HTML with proper `<form>` and `<fieldset>` elements
- ARIA labels and descriptions on all inputs
- Keyboard navigation support
- Focus management across steps
- Error announcements for screen readers
- Color not sole indicator of status (icons + text)
- WCAG 2.1 AA compliant

---

## Performance

- Code split by route (automatic with Astro)
- Form validation debounced (500ms for availability checks)
- Images lazy-loaded
- No unnecessary re-renders
- Optimistic UI updates

---

## Testing

### Unit Tests

```tsx
import { render, screen } from '@testing-library/react';
import { ProfileForm } from '@/components/onboarding/ProfileForm';

test('shows username availability check', async () => {
  render(<ProfileForm userId={userId} onSuccess={jest.fn()} />);
  expect(screen.getByText('3-20 characters')).toBeInTheDocument();
});
```

### Integration Tests

```tsx
// Test complete onboarding flow
test('completes full onboarding', async () => {
  // 1. Signup
  // 2. Verify email
  // 3. Update profile
  // 4. Create workspace
  // 5. Invite team
  // 6. Connect wallet
  // 7. Add skills
  // 8. Verify completed
});
```

---

## Customization

### Styling

Components use Tailwind v4 with HSL color system. Override with CSS variables:

```css
:root {
  --color-primary: 222.2 47.4% 11.2%;
  --color-destructive: 0 84% 60%;
}
```

### Branding

Update in `/installation/knowledge/brand-guide.md`:

```md
# Brand Guide

- Primary color: #2563eb
- Font family: Inter
- Logo: /images/logo.png
```

### Additional Steps

Extend `SignUpOnboarding` to add custom steps:

```tsx
const [currentStep, setCurrentStep] = useState<OnboardingStep>('signup');

// Add to step configs
const STEP_CONFIGS = {
  ...existing,
  custom_step: { number: 4, label: 'Custom' },
};
```

---

## Troubleshooting

### Username check not working

Ensure `useCheckUsernameAvailable` is calling the correct API endpoint:

```bash
GET /api/onboard/check-username?username=john-doe
```

### Wallet detection fails

Check that `window.ethereum` is available:

```tsx
if (!window.ethereum) {
  // MetaMask not installed
}
```

### Rate limiting issues

Extract retry time from error message:

```tsx
const retryMatch = error.message.match(/(\d+)\s+(minutes?|hours?)/);
if (retryMatch) {
  const ms = parseInt(retryMatch[1]) * 60 * 1000;
  setNextRetryAt(Date.now() + ms);
}
```

---

## API Reference

See `/backend/convex/WAVE1_API_REFERENCE.md` for complete backend API documentation.

---

**Last Updated:** 2025-11-01
**Version:** 1.0.0
**Status:** Production Ready
