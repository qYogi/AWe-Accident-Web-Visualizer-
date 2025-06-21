export class TableSorter {
    constructor() {
        this.currentSort = null;
        this.originalData = [];
        this.setupSorting();
    }
    setData(data) {
        this.originalData = [...data];
    }
    setupSorting() {
        const tableHead = document.querySelector('#accidents-table-head');
        if (!tableHead)
            return;
        // Add click listeners to sortable headers
        tableHead.addEventListener('click', (e) => {
            const target = e.target;
            if (target.tagName === 'TH' && target.classList.contains('sortable-header')) {
                const column = target.getAttribute('data-column');
                if (column) {
                    this.handleSort(column);
                }
            }
        });
    }
    handleSort(column) {
        if (!this.originalData.length)
            return;
        // Determine next sort state
        let newState;
        if (!this.currentSort || this.currentSort.column !== column) {
            newState = 'asc';
        }
        else {
            switch (this.currentSort.state) {
                case 'asc':
                    newState = 'desc';
                    break;
                case 'desc':
                    newState = 'neutral';
                    break;
                default:
                    newState = 'asc';
            }
        }
        // Update sort configuration
        this.currentSort = newState === 'neutral' ? null : { column, state: newState };
        // Update visual indicators
        this.updateSortIndicators(column, newState);
        // Sort and display data
        const sortedData = this.sortData(this.originalData, column, newState);
        this.displaySortedData(sortedData);
    }
    sortData(data, column, state) {
        if (state === 'neutral') {
            return [...this.originalData];
        }
        const sorted = [...data].sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];
            // Handle different data types
            if (column === 'severity') {
                // Numeric sorting for severity
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            }
            else if (column === 'start_time' || column === 'end_time') {
                // Date sorting
                aVal = new Date(aVal).getTime();
                bVal = new Date(bVal).getTime();
            }
            else {
                // String sorting for street, city, state
                aVal = (aVal || '').toString().toLowerCase();
                bVal = (bVal || '').toString().toLowerCase();
            }
            if (aVal < bVal)
                return state === 'asc' ? -1 : 1;
            if (aVal > bVal)
                return state === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }
    updateSortIndicators(column, state) {
        const headers = document.querySelectorAll('#accidents-table-head th.sortable-header');
        headers.forEach(header => {
            const headerElement = header;
            const headerColumn = headerElement.getAttribute('data-column');
            // Remove all sort classes
            headerElement.classList.remove('sort-asc', 'sort-desc', 'sort-neutral');
            // Add appropriate class
            if (headerColumn === column) {
                headerElement.classList.add(`sort-${state}`);
            }
            else {
                headerElement.classList.add('sort-neutral');
            }
        });
    }
    displaySortedData(data) {
        const tableBody = document.querySelector('#accidents-table tbody');
        if (!tableBody)
            return;
        tableBody.innerHTML = '';
        data.forEach((accident) => {
            const row = document.createElement('tr');
            const columns = [
                'id',
                'severity',
                'start_time',
                'end_time',
                'description',
                'street',
                'city',
                'county',
                'state',
                'country',
            ];
            columns.forEach((column) => {
                const td = document.createElement('td');
                let value = accident[column] || '';
                if (column.includes('time') && value) {
                    value = new Date(value).toLocaleString();
                }
                td.textContent = value;
                td.setAttribute('title', value);
                row.appendChild(td);
            });
            tableBody.appendChild(row);
        });
    }
    // Public method to create sortable headers (excluding ID column)
    createSortableHeaders() {
        const tableHead = document.querySelector('#accidents-table-head');
        if (!tableHead)
            return;
        const sortableColumns = ['severity', 'start_time', 'end_time', 'street', 'city', 'state'];
        const headers = tableHead.querySelectorAll('th');
        headers.forEach((header, index) => {
            const columnName = header.textContent?.toLowerCase().replace(/\s+/g, '_') || '';
            if (sortableColumns.includes(columnName)) {
                header.classList.add('sortable-header');
                header.setAttribute('data-column', columnName);
                header.classList.add('sort-neutral');
            }
        });
    }
    // Reset sorting
    resetSorting() {
        this.currentSort = null;
        this.updateSortIndicators('', 'neutral');
        this.displaySortedData(this.originalData);
    }
}
// Export singleton instance
export const tableSorter = new TableSorter();
