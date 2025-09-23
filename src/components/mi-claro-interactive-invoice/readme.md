# mi-claro-interactive-invoice

Interactive invoice component for Claro billing system. Features a responsive 2-column layout with payment summary and invoice details.

## Features

- **Responsive Design**: 2-column layout on desktop (30%/70%), stacked on mobile
- **Payment Summary Card**: Shows total amount, payment due date, and expandable details
- **Invoice Table**: Displays invoices with status, payment buttons, and expandable row details
- **Tabbed Interface**: Switch between current invoice and previous invoices
- **Smooth Animations**: Expandable sections with smooth transitions

## Usage

```html
<mi-claro-interactive-invoice></mi-claro-interactive-invoice>
```

## Styling

The component uses Shadow DOM for style encapsulation. Key design elements:
- Cards with rounded corners and subtle shadows
- Blue (#0066CC) for primary actions and titles
- Red (#DC3545) for amounts and payment buttons
- Gray separator lines
- Responsive grid layout

<!-- Auto Generated Below -->


## Properties

| Property      | Attribute      | Description | Type                      | Default                      |
| ------------- | -------------- | ----------- | ------------------------- | ---------------------------- |
| `accountList` | `account-list` |             | `string[]`                | `['805437569', '712331792']` |
| `environment` | `environment`  |             | `"dev" \| "prod" \| "qa"` | `'prod'`                     |


## Events

| Event              | Description | Type                   |
| ------------------ | ----------- | ---------------------- |
| `automatePayments` |             | `CustomEvent<boolean>` |
| `contactPressed`   |             | `CustomEvent<void>`    |
| `downloadBills`    |             | `CustomEvent<void>`    |
| `goToSupport`      |             | `CustomEvent<void>`    |
| `payPendingBills`  |             | `CustomEvent<void>`    |
| `questionsPressed` |             | `CustomEvent<void>`    |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
