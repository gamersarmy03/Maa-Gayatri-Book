let stockPurchases = JSON.parse(localStorage.getItem('stockPurchases')) || [];
let sales = JSON.parse(localStorage.getItem('sales')) || [];
let oldJewelPurchases = JSON.parse(localStorage.getItem('oldJewelPurchases')) || [];
let pledges = JSON.parse(localStorage.getItem('pledges')) || [];
let pledgeRedemptions = JSON.parse(localStorage.getItem('pledgeRedemptions')) || [];
let cashTransactions = JSON.parse(localStorage.getItem('cashTransactions')) || [];
let parties = JSON.parse(localStorage.getItem('parties')) || [];

function saveData() {
    localStorage.setItem('stockPurchases', JSON.stringify(stockPurchases));
    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('oldJewelPurchases', JSON.stringify(oldJewelPurchases));
    localStorage.setItem('pledges', JSON.stringify(pledges));
    localStorage.setItem('pledgeRedemptions', JSON.stringify(pledgeRedemptions));
    localStorage.setItem('cashTransactions', JSON.stringify(cashTransactions));
    localStorage.setItem('parties', JSON.stringify(parties));
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => section.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
    if (sectionId === 'pledge-redeem') updatePledgeDropdown();
    if (sectionId === 'stock-purchase' || sectionId === 'old-jewel') updateCreditorDropdown();
    if (sectionId === 'sales') updateDebtorDropdown();
    if (sectionId === 'cash') updateDebtorSuggestions();
}

function updateCreditorDropdown() {
    const creditorSelects = [document.getElementById('stock-creditor'), document.getElementById('old-jewel-creditor')];
    creditorSelects.forEach(select => {
        select.innerHTML = '<option value="">Select Creditor (Optional)</option>';
        parties.filter(party => party.type === 'creditor').forEach(party => {
            const option = document.createElement('option');
            option.value = party.name;
            option.textContent = party.name;
            select.appendChild(option);
        });
    });
}

function updateDebtorDropdown() {
    const debtorSelect = document.getElementById('sale-debtor');
    debtorSelect.innerHTML = '<option value="">Select Debtor (Optional)</option>';
    parties.filter(party => party.type === 'debtor').forEach(party => {
        const option = document.createElement('option');
        option.value = party.name;
        option.textContent = party.name;
        debtorSelect.appendChild(option);
    });
}

function updatePledgeDropdown() {
    const pledgeSelect = document.getElementById('redeem-pledge');
    pledgeSelect.innerHTML = '<option value="">Select Pledge to Redeem</option>';
    pledges.forEach((pledge, index) => {
        if (!pledge.redeemed) {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${pledge.customer} - ${pledge.description} (${pledge.metal}, ${pledge.date})`;
            pledgeSelect.appendChild(option);
        }
    });
}

function updateDebtorSuggestions() {
    const type = document.getElementById('cash-type').value;
    const datalist = document.getElementById('debtor-suggestions');
    datalist.innerHTML = '';
    if (type === 'receipt') {
        parties.filter(party => party.type === 'debtor' && party.amount > 0).forEach(party => {
            const option = document.createElement('option');
            option.value = party.name;
            datalist.appendChild(option);
        });
    }
}

function addStockPurchase() {
    const date = document.getElementById('stock-date').value;
    const description = document.getElementById('stock-description').value;
    const metal = document.getElementById('stock-metal').value;
    const quantity = parseFloat(document.getElementById('stock-quantity').value);
    const amount = parseFloat(document.getElementById('stock-amount').value);
    const creditor = document.getElementById('stock-creditor').value;
    if (date && description && metal && quantity && amount) {
        stockPurchases.push({ date, description, metal, quantity, amount, creditor });
        saveData();
        displayStockPurchases();
        clearInputs('stock');
    }
}

function addSale() {
    const date = document.getElementById('sale-date').value;
    const description = document.getElementById('sale-description').value;
    const metal = document.getElementById('sale-metal').value;
    const quantity = parseFloat(document.getElementById('sale-quantity').value);
    const amount = parseFloat(document.getElementById('sale-amount').value);
    const debtor = document.getElementById('sale-debtor').value;
    if (date && description && metal && quantity && amount) {
        sales.push({ date, description, metal, quantity, amount, debtor });
        if (debtor) {
            const debtorParty = parties.find(p => p.name === debtor && p.type === 'debtor');
            if (debtorParty) {
                debtorParty.amount += amount;
            } else {
                parties.push({ name: debtor, amount, type: 'debtor' });
            }
        }
        saveData();
        displaySales();
        clearInputs('sale');
        updateDebtorDropdown();
        updateDebtorSuggestions();
    }
}

function addOldJewelPurchase() {
    const date = document.getElementById('old-jewel-date').value;
    const description = document.getElementById('old-jewel-description').value;
    const metal = document.getElementById('old-jewel-metal').value;
    const quantity = parseFloat(document.getElementById('old-jewel-quantity').value);
    const amount = parseFloat(document.getElementById('old-jewel-amount').value);
    const creditor = document.getElementById('old-jewel-creditor').value;
    if (date && description && metal && quantity && amount) {
        oldJewelPurchases.push({ date, description, metal, quantity, amount, creditor });
        saveData();
        displayOldJewelPurchases();
        clearInputs('old-jewel');
    }
}

function addPledge() {
    const date = document.getElementById('pledge-date').value;
    const customer = document.getElementById('pledge-customer').value;
    const description = document.getElementById('pledge-description').value;
    const metal = document.getElementById('pledge-metal').value;
    const quantity = parseFloat(document.getElementById('pledge-quantity').value);
    const amount = parseFloat(document.getElementById('pledge-amount').value);
    if (date && customer && description && metal && quantity && amount) {
        pledges.push({ date, customer, description, metal, quantity, amount, redeemed: false });
        saveData();
        displayPledges();
        clearInputs('pledge');
    }
}

function redeemPledge() {
    const date = document.getElementById('redeem-date').value;
    const pledgeIndex = document.getElementById('redeem-pledge').value;
    const amount = parseFloat(document.getElementById('redeem-amount').value);
    if (date && pledgeIndex && amount) {
        const pledge = pledges[pledgeIndex];
        pledge.redeemed = true;
        pledgeRedemptions.push({ date, customer: pledge.customer, description: pledge.description, amount });
        saveData();
        displayPledgeRedemptions();
        updatePledgeDropdown();
        clearInputs('redeem');
    }
}

function addCashTransaction() {
    const date = document.getElementById('cash-date').value;
    const description = document.getElementById('cash-description').value;
    const amount = parseFloat(document.getElementById('cash-amount').value);
    const type = document.getElementById('cash-type').value;
    if (date && description && amount) {
        cashTransactions.push({ date, description, amount, type });
        if (type === 'receipt') {
            const debtorParty = parties.find(p => p.name === description && p.type === 'debtor');
            if (debtorParty) {
                debtorParty.amount = Math.max(0, debtorParty.amount - amount);
                if (debtorParty.amount === 0) {
                    parties = parties.filter(p => p !== debtorParty);
                }
            }
        }
        saveData();
        displayCashTransactions();
        clearInputs('cash');
        updateDebtorSuggestions();
        displayParties();
    }
}

function addParty() {
    const name = document.getElementById('party-name').value;
    const amount = parseFloat(document.getElementById('party-amount').value);
    const type = document.getElementById('party-type').value;
    if (name && amount) {
        const existingParty = parties.find(p => p.name === name && p.type === type);
        if (existingParty) {
            existingParty.amount += amount;
        } else {
            parties.push({ name, amount, type });
        }
        saveData();
        displayParties();
        clearInputs('party');
        updateCreditorDropdown();
        updateDebtorDropdown();
        updateDebtorSuggestions();
    }
}

function clearInputs(prefix) {
    document.getElementById(`${prefix}-date`).value = '';
    if (document.getElementById(`${prefix}-description`)) document.getElementById(`${prefix}-description`).value = '';
    if (document.getElementById(`${prefix}-metal`)) document.getElementById(`${prefix}-metal`).value = 'gold';
    if (document.getElementById(`${prefix}-quantity`)) document.getElementById(`${prefix}-quantity`).value = '';
    if (document.getElementById(`${prefix}-amount`)) document.getElementById(`${prefix}-amount`).value = '';
    if (document.getElementById(`${prefix}-creditor`)) document.getElementById(`${prefix}-creditor`).value = '';
    if (document.getElementById(`${prefix}-debtor`)) document.getElementById(`${prefix}-debtor`).value = '';
    if (document.getElementById(`${prefix}-customer`)) document.getElementById(`${prefix}-customer`).value = '';
    if (document.getElementById(`${prefix}-type`)) document.getElementById(`${prefix}-type`).value = 'receipt';
    if (document.getElementById(`${prefix}-pledge`)) document.getElementById(`${prefix}-pledge`).value = '';
}

function displayStockPurchases() {
    const table = document.getElementById('stock-purchase-table');
    table.innerHTML = '';
    stockPurchases.forEach(purchase => {
        const row = table.insertRow();
        row.innerHTML = `<td class="border p-2">${purchase.date}</td><td class="border p-2">${purchase.description}</td><td class="border p-2">${purchase.metal}</td><td class="border p-2">${purchase.quantity}</td><td class="border p-2">${purchase.amount}</td><td class="border p-2">${purchase.creditor || ''}</td>`;
    });
}

function displaySales() {
    const table = document.getElementById('sales-table');
    table.innerHTML = '';
    sales.forEach(sale => {
        const row = table.insertRow();
        row.innerHTML = `<td class="border p-2">${sale.date}</td><td class="border p-2">${sale.description}</td><td class="border p-2">${sale.metal}</td><td class="border p-2">${sale.quantity}</td><td class="border p-2">${sale.amount}</td><td class="border p-2">${sale.debtor || ''}</td>`;
    });
}

function displayOldJewelPurchases() {
    const table = document.getElementById('old-jewel-table');
    table.innerHTML = '';
    oldJewelPurchases.forEach(purchase => {
        const row = table.insertRow();
        row.innerHTML = `<td class="border p-2">${purchase.date}</td><td class="border p-2">${purchase.description}</td><td class="border p-2">${purchase.metal}</td><td class="border p-2">${purchase.quantity}</td><td class="border p-2">${purchase.amount}</td><td class="border p-2">${purchase.creditor || ''}</td>`;
    });
}

function displayPledges() {
    const table = document.getElementById('pledge-table');
    table.innerHTML = '';
    pledges.forEach(pledge => {
        const row = table.insertRow();
        row.innerHTML = `<td class="border p-2">${pledge.date}</td><td class="border p-2">${pledge.customer}</td><td class="border p-2">${pledge.description}</td><td class="border p-2">${pledge.metal}</td><td class="border p-2">${pledge.quantity}</td><td class="border p-2">${pledge.amount}</td>`;
    });
}

function displayPledgeRedemptions() {
    const table = document.getElementById('pledge-redeem-table');
    table.innerHTML = '';
    pledgeRedemptions.forEach(redemption => {
        const row = table.insertRow();
        row.innerHTML = `<td class="border p-2">${redemption.date}</td><td class="border p-2">${redemption.customer}</td><td class="border p-2">${redemption.description}</td><td class="border p-2">${redemption.amount}</td>`;
    });
}

function displayCashTransactions() {
    const table = document.getElementById('cash-table');
    table.innerHTML = '';
    cashTransactions.forEach(transaction => {
        const row = table.insertRow();
        row.innerHTML = `<td class="border p-2">${transaction.date}</td><td class="border p-2">${transaction.description}</td><td class="border p-2">${transaction.amount}</td><td class="border p-2">${transaction.type}</td>`;
    });
}

function displayParties() {
    const table = document.getElementById('party-table');
    table.innerHTML = '';
    parties.forEach(party => {
        const row = table.insertRow();
        row.innerHTML = `<td class="border p-2">${party.name}</td><td class="border p-2">${party.amount}</td><td class="border p-2">${party.type}</td>`;
    });
}

function generateJournal() {
    let journal = '<h3 class="text-xl font-semibold mb-2">Journal Entries</h3><table class="w-full border"><thead><tr class="bg-gray-200"><th class="border p-2">Date</th><th class="border p-2">Particulars</th><th class="border p-2">Debit</th><th class="border p-2">Credit</th></tr></thead><tbody>';
    stockPurchases.forEach(p => {
        journal += `<tr><td class="border p-2">${p.date}</td><td class="border p-2">${p.metal} Stock A/c Dr<br>To ${p.creditor || 'Cash'} A/c</td><td class="border p-2">${p.amount}</td><td class="border p-2">${p.amount}</td></tr>`;
    });
    sales.forEach(s => {
        journal += `<tr><td class="border p-2">${s.date}</td><td class="border p-2">${s.debtor || 'Cash'} A/c Dr<br>To ${s.metal} Sales A/c</td><td class="border p-2">${s.amount}</td><td class="border p-2">${s.amount}</td></tr>`;
    });
    oldJewelPurchases.forEach(p => {
        journal += `<tr><td class="border p-2">${p.date}</td><td class="border p-2">${p.metal} Stock A/c Dr<br>To ${p.creditor || 'Cash'} A/c</td><td class="border p-2">${p.amount}</td><td class="border p-2">${p.amount}</td></tr>`;
    });
    pledges.forEach(p => {
        journal += `<tr><td class="border p-2">${p.date}</td><td class="border p-2">${p.customer} (Pledge) A/c Dr<br>To Cash A/c</td><td class="border p-2">${p.amount}</td><td class="border p-2">${p.amount}</td></tr>`;
    });
    pledgeRedemptions.forEach(r => {
        journal += `<tr><td class="border p-2">${r.date}</td><td class="border p-2">Cash A/c Dr<br>To ${r.customer} (Pledge) A/c</td><td class="border p-2">${r.amount}</td><td class="border p-2">${r.amount}</td></tr>`;
    });
    cashTransactions.forEach(t => {
        const particulars = t.type === 'receipt' ? `Cash A/c Dr<br>To ${t.description} A/c` : `${t.description} A/c Dr<br>To Cash A/c`;
        journal += `<tr><td class="border p-2">${t.date}</td><td class="border p-2">${particulars}</td><td class="border p-2">${t.amount}</td><td class="border p-2">${t.amount}</td></tr>`;
    });
    journal += '</tbody></table>';
    document.getElementById('report-output').innerHTML = journal;
    return journal;
}

function downloadJournalPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Journal Entries - Maa Gayatri Book", 10, 10);
    let y = 20;
    stockPurchases.forEach(p => {
        doc.text(`${p.date}: ${p.metal} Stock A/c Dr ${p.amount} | To ${p.creditor || 'Cash'} A/c ${p.amount}`, 10, y);
        y += 10;
    });
    sales.forEach(s => {
        doc.text(`${s.date}: ${s.debtor || 'Cash'} A/c Dr ${s.amount} | To ${s.metal} Sales A/c ${s.amount}`, 10, y);
        y += 10;
    });
    oldJewelPurchases.forEach(p => {
        doc.text(`${p.date}: ${p.metal} Stock A/c Dr ${p.amount} | To ${p.creditor || 'Cash'} A/c ${p.amount}`, 10, y);
        y += 10;
    });
    pledges.forEach(p => {
        doc.text(`${p.date}: ${p.customer} (Pledge) A/c Dr ${p.amount} | To Cash A/c ${p.amount}`, 10, y);
        y += 10;
    });
    pledgeRedemptions.forEach(r => {
        doc.text(`${r.date}: Cash A/c Dr ${r.amount} | To ${r.customer} (Pledge) A/c ${r.amount}`, 10, y);
        y += 10;
    });
    cashTransactions.forEach(t => {
        const particulars = t.type === 'receipt' ? `Cash A/c Dr ${t.amount} | To ${t.description} A/c ${t.amount}` : `${t.description} A/c Dr ${t.amount} | To Cash A/c ${t.amount}`;
        doc.text(`${t.date}: ${particulars}`, 10, y);
        y += 10;
    });
    doc.save('Journal_Maa_Gayatri_Book.pdf');
}

function generateLedger() {
    const accounts = {};
    stockPurchases.forEach(p => {
        accounts[`${p.metal} Stock`] = accounts[`${p.metal} Stock`] || { debit: 0, credit: 0 };
        accounts[p.creditor || 'Cash'] = accounts[p.creditor || 'Cash'] || { debit: 0, credit: 0 };
        accounts[`${p.metal} Stock`].debit += p.amount;
        accounts[p.creditor || 'Cash'].credit += p.amount;
    });
    sales.forEach(s => {
        accounts[s.debtor || 'Cash'] = accounts[s.debtor || 'Cash'] || { debit: 0, credit: 0 };
        accounts[`${s.metal} Sales`] = accounts[`${s.metal} Sales`] || { debit: 0, credit: 0 };
        accounts[s.debtor || 'Cash'].debit += s.amount;
        accounts[`${s.metal} Sales`].credit += s.amount;
    });
    oldJewelPurchases.forEach(p => {
        accounts[`${p.metal} Stock`] = accounts[`${p.metal} Stock`] || { debit: 0, credit: 0 };
        accounts[p.creditor || 'Cash'] = accounts[p.creditor || 'Cash'] || { debit: 0, credit: 0 };
        accounts[`${p.metal} Stock`].debit += p.amount;
        accounts[p.creditor || 'Cash'].credit += p.amount;
    });
    pledges.forEach(p => {
        accounts[`${p.customer} (Pledge)`] = accounts[`${p.customer} (Pledge)`] || { debit: 0, credit: 0 };
        accounts['Cash'] = accounts['Cash'] || { debit: 0, credit: 0 };
        accounts[`${p.customer} (Pledge)`].debit += p.amount;
        accounts['Cash'].credit += p.amount;
    });
    pledgeRedemptions.forEach(r => {
        accounts['Cash'] = accounts['Cash'] || { debit: 0, credit: 0 };
        accounts[`${r.customer} (Pledge)`] = accounts[`${r.customer} (Pledge)`] || { debit: 0, credit: 0 };
        accounts['Cash'].debit += r.amount;
        accounts[`${r.customer} (Pledge)`].credit += r.amount;
    });
    cashTransactions.forEach(t => {
        accounts['Cash'] = accounts['Cash'] || { debit: 0, credit: 0 };
        accounts[t.description] = accounts[t.description] || { debit: 0, credit: 0 };
        if (t.type === 'receipt') {
            accounts['Cash'].debit += t.amount;
            accounts[t.description].credit += t.amount;
        } else {
            accounts[t.description].debit += t.amount;
            accounts['Cash'].credit += t.amount;
        }
    });
    let ledger = '<h3 class="text-xl font-semibold mb-2">Ledger Accounts</h3>';
    for (const [account, { debit, credit }] of Object.entries(accounts)) {
        ledger += `<h4 class="font-semibold">${account} A/c</h4><table class="w-full border mb-4"><thead><tr class="bg-gray-200"><th class="border p-2">Particulars</th><th class="border p-2">Debit</th><th class="border p-2">Credit</th></tr></thead><tbody>`;
        ledger += `<tr><td class="border p-2">Balance</td><td class="border p-2">${debit}</td><td class="border p-2">${credit}</td></tr>`;
        ledger += `</tbody></table>`;
    }
    document.getElementById('report-output').innerHTML = ledger;
    return ledger;
}

function downloadLedgerPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Ledger Accounts - Maa Gayatri Book", 10, 10);
    let y = 20;
    const accounts = {};
    stockPurchases.forEach(p => {
        accounts[`${p.metal} Stock`] = accounts[`${p.metal} Stock`] || { debit: 0, credit: 0 };
        accounts[p.creditor || 'Cash'] = accounts[p.creditor || 'Cash'] || { debit: 0, credit: 0 };
        accounts[`${p.metal} Stock`].debit += p.amount;
        accounts[p.creditor || 'Cash'].credit += p.amount;
    });
    sales.forEach(s => {
        accounts[s.debtor || 'Cash'] = accounts[s.debtor || 'Cash'] || { debit: 0, credit: 0 };
        accounts[`${s.metal} Sales`] = accounts[`${s.metal} Sales`] || { debit: 0, credit: 0 };
        accounts[s.debtor || 'Cash'].debit += s.amount;
        accounts[`${s.metal} Sales`].credit += s.amount;
    });
    oldJewelPurchases.forEach(p => {
        accounts[`${p.metal} Stock`] = accounts[`${p.metal} Stock`] || { debit: 0, credit: 0 };
        accounts[p.creditor || 'Cash'] = accounts[p.creditor || 'Cash'] || { debit: 0, credit: 0 };
        accounts[`${p.metal} Stock`].debit += p.amount;
        accounts[p.creditor || 'Cash'].credit += p.amount;
    });
    pledges.forEach(p => {
        accounts[`${p.customer} (Pledge)`] = accounts[`${p.customer} (Pledge)`] || { debit: 0, credit: 0 };
        accounts['Cash'] = accounts['Cash'] || { debit: 0, credit: 0 };
        accounts[`${p.customer} (Pledge)`].debit += p.amount;
        accounts['Cash'].credit += p.amount;
    });
    pledgeRedemptions.forEach(r => {
        accounts['Cash'] = accounts['Cash'] || { debit: 0, credit: 0 };
        accounts[`${r.customer} (Pledge)`] = accounts[`${r.customer} (Pledge)`] || { debit: 0, credit: 0 };
        accounts['Cash'].debit += r.amount;
        accounts[`${r.customer} (Pledge)`].credit += r.amount;
    });
    cashTransactions.forEach(t => {
        accounts['Cash'] = accounts['Cash'] || { debit: 0, credit: 0 };
        accounts[t.description] = accounts[t.description] || { debit: 0, credit: 0 };
        if (t.type === 'receipt') {
            accounts['Cash'].debit += t.amount;
            accounts[t.description].credit += t.amount;
        } else {
            accounts[t.description].debit += t.amount;
            accounts['Cash'].credit += t.amount;
        }
    });
    for (const [account, { debit, credit }] of Object.entries(accounts)) {
        doc.text(`${account} A/c: Debit ${debit} | Credit ${credit}`, 10, y);
        y += 10;
    }
    doc.save('Ledger_Maa_Gayatri_Book.pdf');
}

function generateTrialBalance() {
    const accounts = {};
    stockPurchases.forEach(p => {
        accounts[`${p.metal} Stock`] = accounts[`${p.metal} Stock`] || { debit: 0, credit: 0 };
        accounts[p.creditor || 'Cash'] = accounts[p.creditor || 'Cash'] || { debit: 0, credit: 0 };
        accounts[`${p.metal} Stock`].debit += p.amount;
        accounts[p.creditor || 'Cash'].credit += p.amount;
    });
    sales.forEach(s => {
        accounts[s.debtor || 'Cash'] = accounts[s.debtor || 'Cash'] || { debit: 0, credit: 0 };
        accounts[`${s.metal} Sales`] = accounts[`${s.metal} Sales`] || { debit: 0, credit: 0 };
        accounts[s.debtor || 'Cash'].debit += s.amount;
        accounts[`${s.metal} Sales`].credit += s.amount;
    });
    oldJewelPurchases.forEach(p => {
        accounts[`${p.metal} Stock`] = accounts[`${p.metal} Stock`] || { debit: 0, credit: 0 };
        accounts[p.creditor || 'Cash'] = accounts[p.creditor || 'Cash'] || { debit: 0, credit: 0 };
        accounts[`${p.metal} Stock`].debit += p.amount;
        accounts[p.creditor || 'Cash'].credit += p.amount;
    });
    pledges.forEach(p => {
        accounts[`${p.customer} (Pledge)`] = accounts[`${p.customer} (Pledge)`] || { debit: 0, credit: 0 };
        accounts['Cash'] = accounts['Cash'] || { debit: 0, credit: 0 };
        accounts[`${p.customer} (Pledge)`].debit += p.amount;
        accounts['Cash'].credit += p.amount;
    });
    pledgeRedemptions.forEach(r => {
        accounts['Cash'] = accounts['Cash'] || { debit: 0, credit: 0 };
        accounts[`${r.customer} (Pledge)`] = accounts[`${r.customer} (Pledge)`] || { debit: 0, credit: 0 };
        accounts['Cash'].debit += r.amount;
        accounts[`${r.customer} (Pledge)`].credit += r.amount;
    });
    cashTransactions.forEach(t => {
        accounts['Cash'] = accounts['Cash'] || { debit: 0, credit: 0 };
        accounts[t.description] = accounts[t.description] || { debit: 0, credit: 0 };
        if (t.type === 'receipt') {
            accounts['Cash'].debit += t.amount;
            accounts[t.description].credit += t.amount;
        } else {
            accounts[t.description].debit += t.amount;
            accounts['Cash'].credit += t.amount;
        }
    });
    parties.forEach(p => {
        accounts[p.name] = accounts[p.name] || { debit: 0, credit: 0 };
        if (p.type === 'creditor') accounts[p.name].credit += p.amount;
        else if (p.type === 'debtor') accounts[p.name].debit += p.amount;
        else if (p.type === 'prepaid') accounts[p.name].debit += p.amount;
    });
    let trialBalance = '<h3 class="text-xl font-semibold mb-2">Trial Balance</h3><table class="w-full border"><thead><tr class="bg-gray-200"><th class="border p-2">Account</th><th class="border p-2">Debit</th><th class="border p-2">Credit</th></tr></thead><tbody>';
    let totalDebit = 0, totalCredit = 0;
    for (const [account, { debit, credit }] of Object.entries(accounts)) {
        trialBalance += `<tr><td class="border p-2">${account}</td><td class="border p-2">${debit}</td><td class="border p-2">${credit}</td></tr>`;
        totalDebit += debit;
        totalCredit += credit;
    });
    trialBalance += `<tr><td class="border p-2 font-bold">Total</td><td class="border p-2 font-bold">${totalDebit}</td><td class="border p-2 font-bold">${totalCredit}</td></tr>`;
    trialBalance += '</tbody></table>';
    document.getElementById('report-output').innerHTML = trialBalance;
    return trialBalance;
}

function downloadTrialBalancePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Trial Balance - Maa Gayatri Book", 10, 10);
    let y = 20;
    const accounts = {};
    stockPurchases.forEach(p => {
        accounts[`${p.metal} Stock`] = accounts[`${p.metal} Stock`] || { debit: 0, credit: 0 };
        accounts[p.creditor || 'Cash'] = accounts[p.creditor || 'Cash'] || { debit: 0, credit: 0 };
        accounts[`${p.metal} Stock`].debit += p.amount;
        accounts[p.creditor || 'Cash'].credit += p.amount;
    });
    sales.forEach(s => {
        accounts[s.debtor || 'Cash'] = accounts[s.debtor || 'Cash'] || { debit: 0, credit: 0 };
        accounts[`${s.metal} Sales`] = accounts[`${s.metal} Sales`] || { debit: 0, credit: 0 };
        accounts[s.debtor || 'Cash'].debit += s.amount;
        accounts[`${s.metal} Sales`].credit += s.amount;
    });
    oldJewelPurchases.forEach(p => {
        accounts[`${p.metal} Stock`] = accounts[`${p.metal} Stock`] || { debit: 0, credit: 0 };
        accounts[p.creditor || 'Cash'] = accounts[p.creditor || 'Cash'] || { debit: 0, credit: 0 };
        accounts[`${p.metal} Stock`].debit += p.amount;
        accounts[p.creditor || 'Cash'].credit += p.amount;
    });
    pledges.forEach(p => {
        accounts[`${p.customer} (Pledge)`] = accounts[`${p.customer} (Pledge)`] || { debit: 0, credit: 0 };
        accounts['Cash'] = accounts['Cash'] || { debit: 0, credit: 0 };
        accounts[`${p.customer} (Pledge)`].debit += p.amount;
        accounts['Cash'].credit += p.amount;
    });
    pledgeRedemptions.forEach(r => {
        accounts['Cash'] = accounts['Cash'] || { debit: 0, credit: 0 };
        accounts[`${r.customer} (Pledge)`] = accounts[`${r.customer} (Pledge)`] || { debit: 0, credit: 0 };
        accounts['Cash'].debit += r.amount;
        accounts[`${r.customer} (Pledge)`].credit += r.amount;
    });
    cashTransactions.forEach(t => {
        accounts['Cash'] = accounts['Cash'] || { debit: 0, credit: 0 };
        accounts[t.description] = accounts[t.description] || { debit: 0, credit: 0 };
        if (t.type === 'receipt') {
            accounts['Cash'].debit += t.amount;
            accounts[t.description].credit += t.amount;
        } else {
            accounts[t.description].debit += t.amount;
            accounts['Cash'].credit += t.amount;
        }
    });
    parties.forEach(p => {
        accounts[p.name] = accounts[p.name] || { debit: 0, credit: 0 };
        if (p.type === 'creditor') accounts[p.name].credit += p.amount;
        else if (p.type === 'debtor') accounts[p.name].debit += p.amount;
        else if (p.type === 'prepaid') accounts[p.name].debit += p.amount;
    });
    for (const [account, { debit, credit }] of Object.entries(accounts)) {
        doc.text(`${account}: Debit ${debit} | Credit ${credit}`, 10, y);
        y += 10;
    }
    doc.save('TrialBalance_Maa_Gayatri_Book.pdf');
}

function generateFinalAccounts() {
    let goldStockValue = stockPurchases.filter(p => p.metal === 'gold').reduce((sum, p) => sum + p.amount, 0) + 
                         oldJewelPurchases.filter(p => p.metal === 'gold').reduce((sum, p) => sum + p.amount, 0);
    let silverStockValue = stockPurchases.filter(p => p.metal === 'silver').reduce((sum, p) => sum + p.amount, 0) + 
                           oldJewelPurchases.filter(p => p.metal === 'silver').reduce((sum, p) => sum + p.amount, 0);
    let goldSalesValue = sales.filter(s => s.metal === 'gold').reduce((sum, s) => sum + s.amount, 0);
    let silverSalesValue = sales.filter(s => s.metal === 'silver').reduce((sum, s) => sum + s.amount, 0);
    let cashBalance = cashTransactions.reduce((sum, t) => t.type === 'receipt' ? sum + t.amount : sum - t.amount, 0);
    cashBalance -= stockPurchases.filter(p => !p.creditor).reduce((sum, p) => sum + p.amount, 0);
    cashBalance -= oldJewelPurchases.filter(p => !p.creditor).reduce((sum, p) => sum + p.amount, 0);
    cashBalance += sales.filter(s => !s.debtor).reduce((sum, s) => sum + s.amount, 0);
    cashBalance -= pledges.reduce((sum, p) => sum + p.amount, 0);
    cashBalance += pledgeRedemptions.reduce((sum, r) => sum + r.amount, 0);
    let debtors = parties.filter(p => p.type === 'debtor').reduce((sum, p) => sum + p.amount, 0);
    let creditors = parties.filter(p => p.type === 'creditor').reduce((sum, p) => sum + p.amount, 0);
    creditors += stockPurchases.filter(p => p.creditor).reduce((sum, p) => sum + p.amount, 0);
    creditors += oldJewelPurchases.filter(p => p.creditor).reduce((sum, p) => sum + p.amount, 0);
    let pledgesBalance = pledges.filter(p => !p.redeemed).reduce((sum, p) => sum + p.amount, 0);
    let goldProfit = goldSalesValue - (goldStockValue * 0.8);
    let silverProfit = silverSalesValue - (silverStockValue * 0.8);
    let totalProfit = goldProfit + silverProfit;
    let finalAccounts = '<h3 class="text-xl font-semibold mb-2">Final Accounts</h3>';
    finalAccounts += '<h4 class="font-semibold">Profit and Loss Account</h4><table class="w-full border mb-4"><thead><tr class="bg-gray-200"><th class="border p-2">Particulars</th><th class="border p-2">Amount</th></tr></thead><tbody>';
    finalAccounts += `<tr><td class="border p-2">Gold Sales</td><td class="border p-2">${goldSalesValue}</td></tr>`;
    finalAccounts += `<tr><td class="border p-2">Silver Sales</td><td class="border p-2">${silverSalesValue}</td></tr>`;
    finalAccounts += `<tr><td class="border p-2">Less: Cost of Gold Goods Sold</td><td class="border p-2">${goldStockValue * 0.8}</td></tr>`;
    finalAccounts += `<tr><td class="border p-2">Less: Cost of Silver Goods Sold</td><td class="border p-2">${silverStockValue * 0.8}</td></tr>`;
    finalAccounts += `<tr><td class="border p-2 font-bold">Net Profit</td><td class="border p-2 font-bold">${totalProfit}</td></tr>`;
    finalAccounts += '</tbody></table>';
    finalAccounts += '<h4 class="font-semibold">Balance Sheet</h4><table class="w-full border"><thead><tr class="bg-gray-200"><th class="border p-2">Liabilities</th><th class="border p-2">Amount</th><th class="border p-2">Assets</th><th class="border p-2">Amount</th></tr></thead><tbody>';
    finalAccounts += `<tr><td class="border p-2">Capital (incl. Profit)</td><td class="border p-2">${totalProfit}</td><td class="border p-2">Cash</td><td class="border p-2">${cashBalance}</td></tr>`;
    finalAccounts += `<tr><td class="border p-2">Creditors</td><td class="border p-2">${creditors}</td><td class="border p-2">Debtors</td><td class="border p-2">${debtors}</td></tr>`;
    finalAccounts += `<tr><td class="border p-2"></td><td class="border p-2"></td><td class="border p-2">Pledges Receivable</td><td class="border p-2">${pledgesBalance}</td></tr>`;
    finalAccounts += `<tr><td class="border p-2"></td><td class="border p-2"></td><td class="border p-2">Gold Closing Stock</td><td class="border p-2">${goldStockValue}</td></tr>`;
    finalAccounts += `<tr><td class="border p-2"></td><td class="border p-2"></td><td class="border p-2">Silver Closing Stock</td><td class="border p-2">${silverStockValue}</td></tr>`;
    finalAccounts += '</tbody></table>';
    document.getElementById('report-output').innerHTML = finalAccounts;
    return finalAccounts;
}

function downloadFinalAccountsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Final Accounts - Maa Gayatri Book", 10, 10);
    let y = 20;
    let goldStockValue = stockPurchases.filter(p => p.metal === 'gold').reduce((sum, p) => sum + p.amount, 0) + 
                         oldJewelPurchases.filter(p => p.metal === 'gold').reduce((sum, p) => sum + p.amount, 0);
    let silverStockValue = stockPurchases.filter(p => p.metal === 'silver').reduce((sum, p) => sum + p.amount, 0) + 
                           oldJewelPurchases.filter(p => p.metal === 'silver').reduce((sum, p) => sum + p.amount, 0);
    let goldSalesValue = sales.filter(s => s.metal === 'gold').reduce((sum, s) => sum + s.amount, 0);
    let silverSalesValue = sales.filter(s => s.metal === 'silver').reduce((sum, s) => sum + s.amount, 0);
    let cashBalance = cashTransactions.reduce((sum, t) => t.type === 'receipt' ? sum + t.amount : sum - t.amount, 0);
    cashBalance -= stockPurchases.filter(p => !p.creditor).reduce((sum, p) => sum + p.amount, 0);
    cashBalance -= oldJewelPurchases.filter(p => !p.creditor).reduce((sum, p) => sum + p.amount, 0);
    cashBalance += sales.filter(s => !s.debtor).reduce((sum, s) => sum + s.amount, 0);
    cashBalance -= pledges.reduce((sum, p) => sum + p.amount, 0);
    cashBalance += pledgeRedemptions.reduce((sum, r) => sum + r.amount, 0);
    let debtors = parties.filter(p => p.type === 'debtor').reduce((sum, p) => sum + p.amount, 0);
    let creditors = parties.filter(p => p.type === 'creditor').reduce((sum, p) => sum + p.amount, 0);
    creditors += stockPurchases.filter(p => p.creditor).reduce((sum, p) => sum + p.amount, 0);
    creditors += oldJewelPurchases.filter(p => p.creditor).reduce((sum, p) => sum + p.amount, 0);
    let pledgesBalance = pledges.filter(p => !p.redeemed).reduce((sum, p) => sum + p.amount, 0);
    let goldProfit = goldSalesValue - (goldStockValue * 0.8);
    let silverProfit = silverSalesValue - (silverStockValue * 0.8);
    let totalProfit = goldProfit + silverProfit;
    doc.text("Profit and Loss Account", 10, y);
    y += 10;
    doc.text(`Gold Sales: ${goldSalesValue}`, 10, y);
    y += 10;
    doc.text(`Silver Sales: ${silverSalesValue}`, 10, y);
    y += 10;
    doc.text(`Less: Cost of Gold Goods Sold: ${goldStockValue * 0.8}`, 10, y);
    y += 10;
    doc.text(`Less: Cost of Silver Goods Sold: ${silverStockValue * 0.8}`, 10, y);
    y += 10;
    doc.text(`Net Profit: ${totalProfit}`, 10, y);
    y += 20;
    doc.text("Balance Sheet", 10, y);
    y += 10;
    doc.text(`Liabilities: Capital (incl. Profit): ${totalProfit}`, 10, y);
    y += 10;
    doc.text(`Creditors: ${creditors}`, 10, y);
    y += 10;
    doc.text(`Assets: Cash: ${cashBalance}`, 10, y);
    y += 10;
    doc.text(`Debtors: ${debtors}`, 10, y);
    y += 10;
    doc.text(`Pledges Receivable: ${pledgesBalance}`, 10, y);
    y += 10;
    doc.text(`Gold Closing Stock: ${goldStockValue}`, 10, y);
    y += 10;
    doc.text(`Silver Closing Stock: ${silverStockValue}`, 10, y);
    doc.save('FinalAccounts_Maa_Gayatri_Book.pdf');
}

// Initialize displays
displayStockPurchases();
displaySales();
displayOldJewelPurchases();
displayPledges();
displayPledgeRedemptions();
displayCashTransactions();
displayParties();
