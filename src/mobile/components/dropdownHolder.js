export default class DropdownHolder {
    static dropdown;

    static setDropdown(ref) {
        this.dropdown = ref;
    }

    static getDropdown() {
        return this.dropdown;
    }
}
