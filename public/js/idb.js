let db;
const request = indexedDB.open('budget_tracker', 1);
// only runs on creation or update
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('budget', { autoIncrement: true })
};
// upon success
request.onsuccess = function(event) {
    db = event.target.result;
    if(navigator.onLine) {
        uploadBudget();
    }
}
// upon error
request.onerror = function(event) {
    console.log(event.target.errorCode);
}

function saveRecord(record) {
    const transaction = db.transaction(['budget'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('budget');
    budgetObjectStore.add(record);
    console.log(record);
}

function uploadBudget() {
    const transaction = db.transaction(['budget'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('budget');
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message) {
                    throw new Error(serverResponse)
                }
                const transaction = db.transaction(['budget'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('budget');
                budgetObjectStore.clear();
            })
            .catch(err => console.log(err))
        }
    }
}

window.addEventListener('online', uploadBudget);