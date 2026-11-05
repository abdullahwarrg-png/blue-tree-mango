import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, useWindowDimensions, Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView }
  from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

/** @type {[string, number][]} */
const prices = [
  ['Under 3 feet', 3900], ['3 to 5 feet', 6900],
  ['6 to 8 feet', 9900], ['Over 8 feet', 19900],
];
const money = (sen) => `MYR ${Math.floor(sen / 100)}.`
  + String(sen % 100).padStart(2, '0');
const positiveInteger = (text) => /^\d+$/.test(text)
  && Number.isSafeInteger(Number(text)) && Number(text) > 0;

function Row({ label, value, total = false }) {
  return <View style={[s.row, total && s.total]}>
    <Text style={total ? s.totalLabel : s.muted}>{label}</Text>
    <Text style={total ? s.totalValue : s.value}>{value}</Text>
  </View>;
}

function Choice({ label, value, onChange, error }) {
  return <View style={s.question}>
    <Text style={s.label}>{label}</Text>
    <View style={s.choices} accessibilityRole="radiogroup">
      {['Yes', 'No'].map((option) =>
        <Pressable key={option} accessibilityRole="radio"
          accessibilityLabel={`${label} ${option}`}
          accessibilityState={{ checked: value === option }}
          onPress={() => onChange(option)}
          {...(Platform.OS === 'web' ? {
            onKeyDown: (event) => {
              const key = event.nativeEvent.key;
              if ([' ', 'Enter'].includes(key)) {
                event.preventDefault();
                onChange(option);
              }
            },
          } : {})}
          style={({ pressed }) => [s.choice,
            value === option && s.selected, pressed && s.pressed]}>
          <Text style={value === option ? s.active : s.value}>
            {value === option ? '●' : '○'}  {option}
          </Text>
        </Pressable>)}
    </View>
    {!!error && <Text role="alert" style={s.error}>{error}</Text>}
  </View>;
}

export default function App() {
  const [form, setForm] = useState({
    quantity: '', height: '', planting: '', delivery: '',
  });
  const [errors, setErrors] = useState(
    /** @type {Record<string, string>} */ ({})
  );
  const [invoice, setInvoice] = useState(null);
  const wide = useWindowDimensions().width >= 800;
  const update = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value,
      ...(key === 'planting' ? { delivery: '' } : {}),
    }));
    setErrors({});
    setInvoice(null);
  };

  function calculate() {
    /** @type {Record<string, string>} */
    const next = {};
    for (const key of ['quantity', 'height']) {
      if (!positiveInteger(form[key]))
        next[key] = 'Enter a positive whole number.';
    }
    if (!form.planting) next.planting = 'Choose Yes or No.';
    if (form.planting === 'No' && !form.delivery)
      next.delivery = 'Choose Yes or No.';
    if (Object.keys(next).length) return setErrors(next);

    const quantity = Number(form.quantity);
    const height = Number(form.height);
    const unit = prices[height < 3 ? 0 : height <= 5
      ? 1 : height <= 8 ? 2 : 3][1];
    const subtotal = quantity * unit;
    const planting = form.planting === 'Yes' ? subtotal / 2 : 0;
    const delivery = form.planting === 'No'
      && form.delivery === 'Yes' ? Math.min(quantity, 5) * 2000 : 0;
    const total = subtotal + planting + delivery;
    if (![subtotal, planting, total].every(Number.isSafeInteger))
      return setErrors({ quantity: 'This quantity is too large.' });
    const service = form.planting === 'Yes'
      ? 'Delivery and planting' : form.delivery === 'Yes'
        ? 'Delivery only' : 'Cash and carry';
    setErrors({});
    setInvoice({ quantity, height, unit, subtotal,
      planting, delivery, total, service });
  }

  return <SafeAreaProvider><SafeAreaView style={s.safe}>
    <StatusBar style="dark" />
    <ScrollView keyboardShouldPersistTaps="handled"
      contentContainerStyle={s.scroll}>
      <View style={s.page}>
        <View style={s.header}>
          <Text style={s.brand}>THE BLUE TREE</Text>
          <Text role="heading" aria-level={1} style={s.title}>
            Mango Tree Purchase System
          </Text>
          <Text style={s.muted}>
            Choose your trees. We will take care of the rest.
          </Text>
        </View>
        <View style={s.card} testID="pricing">
          <Text role="heading" style={s.heading}>
            Pricing information
          </Text>
          {prices.map(([label, price]) =>
            <Row key={label} label={label} value={money(price)} />)}
          <View style={s.rule} />
          <Text style={s.note}>All tree prices include tax.</Text>
          <Text style={s.note}>
            Delivery only: MYR 20 per tree, up to MYR 100 per order.
          </Text>
          <Text style={s.note}>
            Delivery and planting: 50% of the tree subtotal.
          </Text>
        </View>
        <View style={[s.columns, wide && s.wide]}>
          <View style={[s.card, wide && s.column]}
            testID="order-form">
            <Text role="heading" style={s.heading}>
              1. Purchase details
            </Text>
            <Text style={s.note}>
              All trees in an order must be the same height.
            </Text>
            {['quantity', 'height'].map((key) => {
              const label = key === 'quantity'
                ? 'Number of trees' : 'Tree height (whole feet)';
              return <View key={key} style={s.question}>
                <Text nativeID={`${key}-label`} style={s.label}>
                  {label}
                </Text>
                <TextInput value={form[key]}
                  onChangeText={(value) => update(key, value)}
                  accessibilityLabel={label}
                  aria-labelledby={`${key}-label`}
                  aria-invalid={!!errors[key]} keyboardType="number-pad"
                  placeholder={key === 'quantity' ? 'e.g. 4' : 'e.g. 7'}
                  placeholderTextColor="#718078"
                  style={[s.input, errors[key] && s.invalid]} />
                {!!errors[key] && <Text role="alert" style={s.error}>
                  {errors[key]}
                </Text>}
              </View>;
            })}
            <Choice label="Planting by the Blue Tree?"
              value={form.planting} error={errors.planting}
              onChange={(value) => update('planting', value)} />
            {form.planting === 'Yes' && <Text style={s.hint}>
              Delivery is included with planting.
            </Text>}
            {form.planting === 'No' &&
              <Choice label="Delivery required?"
                value={form.delivery} error={errors.delivery}
                onChange={(value) => update('delivery', value)} />}
            <Pressable accessibilityRole="button"
              onPress={calculate} style={({ pressed }) =>
                [s.button, pressed && s.pressed]}>
              <Text style={s.buttonText}>Calculate Invoice</Text>
            </Pressable>
          </View>
          <View style={[s.card, wide && s.column]}
            testID="invoice-panel"
            accessibilityLiveRegion="polite">
            <Text role="heading" style={s.heading}>
              2. Invoice of Purchase
            </Text>
            {!invoice ? <View style={s.empty}>
              <Text style={s.emptyTitle}>Your invoice starts here</Text>
              <Text style={s.muted}>
                Enter your purchase details, choose your service,
                then tap Calculate Invoice.
              </Text>
            </View> : <View testID="invoice">
              <Text style={s.receipt}>PURCHASE SUMMARY</Text>
              <Row label="Number of trees"
                value={String(invoice.quantity)} />
              <Row label="Tree height"
                value={`${invoice.height} feet`} />
              <Row label="Service" value={invoice.service} />
              <View style={s.rule} />
              <Row label="Price per tree" value={money(invoice.unit)} />
              <Row label={`${invoice.quantity} trees × unit price`}
                value={money(invoice.subtotal)} />
              <Row label="Delivery charge"
                value={money(invoice.delivery)} />
              <Row label="Planting charge"
                value={money(invoice.planting)} />
              <Row label="Total amount due" total
                value={money(invoice.total)} />
              <Text style={s.note}>Tax included. No extra tax is added.</Text>
            </View>}
          </View>
        </View>
        <Text style={s.footer}>
          The Blue Tree · Mango trees, made simple.
        </Text>
      </View>
    </ScrollView>
  </SafeAreaView></SafeAreaProvider>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f7f6' },
  scroll: { flexGrow: 1, padding: 20 },
  page: { width: '100%', maxWidth: 1040, alignSelf: 'center', gap: 20 },
  header: { gap: 10, paddingVertical: 16 },
  brand: { color: '#245b45', fontSize: 12,
    fontWeight: '700', letterSpacing: 2 },
  title: { fontSize: 29, fontWeight: '700', color: '#18352a' },
  heading: { fontSize: 20, fontWeight: '700',
    color: '#18352a', marginBottom: 14 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20,
    borderWidth: 1, borderColor: '#dce4df' },
  column: { flex: 1 },
  columns: { gap: 20, alignItems: 'stretch' },
  wide: { flexDirection: 'row', alignItems: 'flex-start' },
  row: { flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', gap: 12, paddingVertical: 9 },
  muted: { color: '#52635a', fontSize: 15,
    lineHeight: 22, flexShrink: 1 },
  value: { color: '#22392d', fontSize: 15,
    fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  note: { color: '#52635a', fontSize: 13, lineHeight: 21 },
  rule: { height: 1, backgroundColor: '#e1e7e3', marginVertical: 10 },
  question: { marginTop: 20, gap: 8 },
  label: { color: '#22392d', fontSize: 15, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#a8b9ae',
    borderRadius: 7, padding: 12, fontSize: 17,
    color: '#18352a', minHeight: 48 },
  invalid: { borderColor: '#ac2424' },
  error: { color: '#ac2424', fontSize: 13, lineHeight: 20 },
  choices: { flexDirection: 'row', gap: 10 },
  choice: { flex: 1, borderWidth: 1, borderColor: '#a8b9ae',
    borderRadius: 7, minHeight: 48, alignItems: 'center',
    justifyContent: 'center', padding: 10 },
  selected: { backgroundColor: '#edf5ef', borderColor: '#245b45' },
  active: { color: '#245b45', fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.7 },
  hint: { color: '#245b45', fontSize: 13,
    lineHeight: 21, marginTop: 10 },
  button: { backgroundColor: '#245b45', borderRadius: 7,
    padding: 16, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  empty: { paddingVertical: 28, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#22392d' },
  receipt: { color: '#52635a', fontSize: 11,
    letterSpacing: 1.5, marginVertical: 10 },
  total: { borderTopWidth: 1, borderColor: '#dce4df',
    marginTop: 14, paddingVertical: 20, flexWrap: 'wrap' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#18352a' },
  totalValue: { fontSize: 25, fontWeight: '700', color: '#245b45' },
  footer: { color: '#617269', fontSize: 12,
    textAlign: 'center', paddingVertical: 8 },
});
