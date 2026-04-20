function Kitty(name, color, size, personality) { 
    this.name = name; this.color = color; this.size = size; this.personality = personality; 
}
// Each kitty object could have methods, or ways to act... like...
Kitty.prototype.purr = function() { return this.name + ' purrs.'; }