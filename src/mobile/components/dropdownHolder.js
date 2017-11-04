export default class DropdownHolder {
    static dropdown;

    static setDropdown(ref) {
        this.dropDown = ref;
    }

    static getDropdown() {
        return this.dropdown;
    }
}
