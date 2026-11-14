# Interface languages

English (`en`) is the default. `LanguageToggle` is shared by customer navigation,
the admin header, the flight admin header, and authentication fallback screens.
The selection is stored as `skywing.language` in localStorage and reflected in
the document's `lang` attribute. Subscriptions update existing components without
remounting forms or changing booking draft data.

`messages.json` contains UI translations as `[English, Vietnamese]` pairs.
`systemMessages.json` covers system notifications and known authentication errors.
Keys and either translation can be passed to `localize()`. Unknown content is
returned unchanged so custom account names, fare names, and service descriptions
are not automatically rewritten. Parameters use `{0}`, `{1}`, etc.

Use `useLanguage()` once in a component that renders localized copy; wrap visible
text, placeholders, titles, and accessible labels in `localize()`. Translate at
render time so messages already on screen also change language. Keep route paths,
API enum values, input values, and material icon names unchanged. `getLocale()`
provides the locale for dates, numbers, and currency; the currency remains VND.
