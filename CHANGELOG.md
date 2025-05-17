## [3.0.1] 2025-06-02

### Next 15 breaking changes fixed
- Cookies / createClient async
- Auth params & searchParams made promises

## [3.0.0] 2025-27-01

### Upgraded to React 19 ⚡️

### Upgraded to Next.js 15 ⚡️

## [2.0.2] 2024-09-11

### Code Cleanup, Next Link, Shadcn components optimization

## [2.0.1] 2024-09-05

### Added banner card + notifications card to settings page. 

## [2.0.0] 2024-08-21

### Big update: Supabase SSR, Refactoring & custom auth components

- #### Supabase SSR
- Utils ⁠ folder refactored, now functions are organized in separate folders based on usage
- ⁠New auth-related utils
- ⁠Functions like ⁠ getSessions ⁠ were removed because of the use of Supabase SSR
- session ⁠ object was replaced with ⁠ user ⁠ throughout the project

- #### Layout refactoring
- ⁠The multiple addition of functionalities led to prop drilling, which was fixed by using contexts.

- #### Separate auth pages
- ⁠Auth pages are dynamic Next.js pages, one for each of Update password, sign up, password sign in, etc.
- ⁠The forms for each type of authentication types are located in ⁠ @/components/auth-ui 

- #### Added Docker support
- You can now develop locally via Docker by using Supabase CLI

## [1.1.0] 2024-07-11

### Added new charts on Main Dashboard

- Bar chart added
- Area chart added

## [1.0.1] 2024-05-27

### Errors removed

- All vulerabilities removed
- Dependencies up to date

## [1.0.0] 2024-05-20

### Initial Release

- Added Shadcn UI as base framework