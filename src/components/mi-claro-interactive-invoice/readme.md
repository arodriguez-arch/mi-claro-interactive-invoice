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

| Property                   | Attribute                  | Description | Type                                                      | Default                                                |
| -------------------------- | -------------------------- | ----------- | --------------------------------------------------------- | ------------------------------------------------------ |
| `accountList`              | `account-list`             |             | `string[]`                                                | `['769001587', '805437569', '799704751', '805437569']` |
| `customerName`             | `customer-name`            |             | `string`                                                  | `undefined`                                            |
| `defaultSelectedAccount`   | `default-selected-account` |             | `string`                                                  | `''`                                                   |
| `environment` _(required)_ | `environment`              |             | `"dev" \| "dss" \| "local" \| "prod" \| "uat" \| "uat40"` | `undefined`                                            |
| `token`                    | `token`                    |             | `string`                                                  | `''`                                                   |
| `totalAPagar`              | `total-a-pagar`            |             | `number`                                                  | `undefined`                                            |
| `vencimientoDate`          | `vencimiento-date`         |             | `string`                                                  | `undefined`                                            |


## Events

| Event              | Description | Type                   |
| ------------------ | ----------- | ---------------------- |
| `accountChanged`   |             | `CustomEvent<string>`  |
| `automatePayments` |             | `CustomEvent<boolean>` |
| `contactPressed`   |             | `CustomEvent<void>`    |
| `downloadBills`    |             | `CustomEvent<void>`    |
| `goToSupport`      |             | `CustomEvent<void>`    |
| `payPendingBills`  |             | `CustomEvent<void>`    |
| `questionsPressed` |             | `CustomEvent<void>`    |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
