---
"@nannier/canvas": patch
---

Resolve the measure axis (`stepOf`, which every measure step on Autocomplete, Button, ButtonGroup, Container, Field, Form, Input, Listbox, PhoneInput, Progress, Select, Slider and Textarea goes through) with `pick` over its declared table, the first resolver on an axis table. The recorded characterization is unchanged: the narrowest step still wins. No prop or behaviour changes.
