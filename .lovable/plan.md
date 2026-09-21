# Company fields: wait for API support

## What we checked against the live store

- The session response only returns two settings: store name and logo. Nothing about company name, organisation/personal number, or B2B.
- The field-list endpoints the store would use to describe the registration form all answer "not found" (`accounts/constraints`, `accounts/create/constraints`, plus several other candidates).

So the admin toggle "Allow customers to enter company at registration and in My account" is not readable from the API today. The store front cannot know whether it is on.

## Decision

Do not add the fields now, and do not add a manual switch. Wait until the store exposes the setting.

## What this plan changes (documentation only)

1. Note in the API reference that store configuration currently exposes only store name and logo, and that no endpoint reports the company / organisation number toggles.
2. Note in the registration/account notes that company name and organisation number stay hidden until the store reports them, and that the registration form already builds itself from the field list when that endpoint starts answering.

No storefront behaviour, layout, or request logic changes.

## When the API is ready

Once the store returns either the setting in the session configuration or a working field list, the registration form picks the fields up through the existing field-list path; only the field labels and the matching inputs in My account need to be added at that point.
