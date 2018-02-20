var fps=30;
var second=1000/fps;
var cycloa = {};
cycloa.err = {};
cycloa.util = {};
cycloa.debug = false;
cycloa.NesPalette = new Uint32Array([7895160, 2097328, 2621624, 6295712, 9969784, 11538480, 10498048, 7880704, 4741120, 3696640, 3697664, 3170368, 3166336, 0, 0, 0, 11579568, 4219128, 4210943, 9453808, 14172352, 14172256, 14700544, 12611584, 8947712, 5283840, 4761616, 4759656, 4231360, 0, 0, 0, 16777215, 6332671, 5275903, 10514687, 15753471, 16736432, 16742448, 16752640, 15257632, 10020864, 7401536, 7397520, 6344928, 7895160, 0, 0, 16777215, 9490687, 10533119, 12628223, 14725375, 16759016, 16763064, 16767136, 16773264, 13168768, 10547360, 10551240, 10551280, 10526880, 0, 0]);
cycloa.err.Exception = function(a, b) {
    this.name = a;
    this.message = "[" + a.toString() + "] " + b
};
cycloa.err.Exception.prototype.toString = function() {
    return this.message
};
cycloa.err.CoreException = function(a) {
    cycloa.err.Exception.call(this, "CoreException", a)
};
cycloa.err.CoreException.prototype = {
    __proto__: cycloa.err.Exception.prototype
};
cycloa.err.NotImplementedException = function(a) {
    cycloa.err.Exception.call(this, "NotImplementedException", a)
};
cycloa.err.NotImplementedException.prototype = {
    __proto__: cycloa.err.Exception.prototype
};
cycloa.err.NotSupportedException = function(a) {
    cycloa.err.Exception.call(this, "NotSupportedException", a)
};
cycloa.err.NotSupportedException.prototype = {
    __proto__: cycloa.err.Exception.prototype
};
cycloa.util.formatHex = function(b, a) {
    a = a || 8;
    return ("0000" + b.toString(16).toUpperCase()).slice(-(a >> 2))
};
cycloa.Tracer = function(a) {
    this.m = a;
    this.code_ = new Uint8Array(3);
    this.code_idx_ = 0;
    this.addr_ = undefined;
    this.addr_repr_ = undefined;
    this.addr_resolved_repr_ = undefined;
    this.decode = function() {
        var f = this[this.opcode_ = this.m.read(this.m.PC)]();
        var e = "$" + cycloa.util.formatHex(this.m.PC, 16) + ":";
        for (var c = 0, b = 3; c < b; ++c) {
            e += c < this.code_idx_ ? cycloa.util.formatHex(this.code_[c]) + " " : "   "
        }
        e += " " + f;
        var d = "";
        d += "A: " + cycloa.util.formatHex(this.m.A, 8);
        d += " X: " + cycloa.util.formatHex(this.m.X, 8);
        d += " Y: " + cycloa.util.formatHex(this.m.Y, 8);
        d += " S: " + cycloa.util.formatHex(this.m.SP, 8);
        d += " P:";
        d += (this.m.P & 128) ? "N" : "n";
        d += (this.m.P & 64) ? "V" : "v";
        d += (this.m.P & 32) ? "U" : "u";
        d += (this.m.P & 16) ? "B" : "b";
        d += (this.m.P & 8) ? "D" : "d";
        d += (this.m.P & 4) ? "I" : "i";
        d += (this.m.P & 2) ? "Z" : "z";
        d += (this.m.P & 1) ? "C" : "c";
        return (e + "                                             ").slice(0, 43) + d
    };
    this.readCode_ = function(c) {
        for (var b = 0; b < c; ++b) {
            this.code_[b] = this.m.read(this.m.PC + b)
        }
        this.code_idx_ = c
    };
    this.formatResolvedAddr_ = function() {
        return " = #$" + cycloa.util.formatHex(this.m.read(this.addr_))
    };
    this.addrNone = function() {
        this.readCode_(1);
        this.addr_repr_ = "";
        this.addr_resolved_repr_ = ""
    };
    this.addrImmediate = function() {
        this.readCode_(2);
        this.addr_ = this.m.PC + 1;
        this.addr_repr_ = "#$" + cycloa.util.formatHex(this.m.read(this.m.PC + 1));
        this.addr_resolved_repr_ = ""
    };
    this.addrZeropage = function() {
        this.readCode_(2);
        this.addr_ = this.m.read(this.m.PC + 1);
        this.addr_repr_ = "$" + cycloa.util.formatHex(this.addr_);
        this.addr_resolved_repr_ = this.formatResolvedAddr_()
    };
    this.addrZeropageX = function() {
        this.readCode_(2);
        var b = this.m.read(this.m.PC + 1);
        this.addr_ = (b + this.m.X) & 255;
        this.addr_repr_ = "$" + cycloa.util.formatHex(b) + ",X @ $" + cycloa.util.formatHex(this.addr_);
        this.addr_resolved_repr_ = this.formatResolvedAddr_()
    };
    this.addrZeropageY = function() {
        this.readCode_(2);
        var b = this.m.read(this.m.PC + 1);
        this.addr_ = (b + this.m.Y) & 255;
        this.addr_repr_ = "$" + cycloa.util.formatHex(b) + ",Y @ $" + cycloa.util.formatHex(this.addr_);
        this.addr_resolved_repr_ = this.formatResolvedAddr_()
    };
    this.addrAbsolute = function() {
        this.readCode_(3);
        this.addr_ = this.m.read(this.m.PC + 1) | (this.m.read(this.m.PC + 2) << 8);
        this.addr_repr_ = "$" + cycloa.util.formatHex(this.addr_, 16);
        this.addr_resolved_repr_ = this.formatResolvedAddr_()
    };
    this.addrAbsoluteX = function() {
        this.readCode_(3);
        var b = (this.m.read(this.m.PC + 1) | (this.m.read(this.m.PC + 2) << 8));
        this.addr_ = (b + this.m.X) & 65535;
        this.addr_repr_ = "$" + cycloa.util.formatHex(b, 16) + ",X @ $" + cycloa.util.formatHex(this.addr_, 16);
        this.addr_resolved_repr_ = this.formatResolvedAddr_()
    };
    this.addrAbsoluteY = function() {
        this.readCode_(3);
        var b = (this.m.read(this.m.PC + 1) | (this.m.read(this.m.PC + 2) << 8));
        this.addr_ = (b + this.m.Y) & 65535;
        this.addr_repr_ = "$" + cycloa.util.formatHex(b, 16) + ",Y @ $" + cycloa.util.formatHex(this.addr_, 16);
        this.addr_resolved_repr_ = this.formatResolvedAddr_()
    };
    this.addrIndirect = function() {
        this.readCode_(3);
        var b = this.m.read(this.m.PC + 1) | (this.m.read(this.m.PC + 2) << 8);
        this.addr_ = this.m.read(b) | (this.m.read((b & 65280) | ((b + 1) & 255)) << 8);
        this.addr_repr_ = "($" + cycloa.util.formatHex(b, 16) + ") @ $" + cycloa.util.formatHex(this.addr_, 16);
        this.addr_resolved_repr_ = this.formatResolvedAddr_()
    };
    this.addrIndirectX = function() {
        this.readCode_(2);
        var b = (this.m.read(this.m.PC + 1) + this.m.X) & 255;
        this.addr_ = this.m.read(b) | (this.m.read((b + 1) & 255) << 8);
        this.addr_repr_ = "($" + cycloa.util.formatHex(b) + ",X) @ $" + cycloa.util.formatHex(this.addr_, 16);
        this.addr_resolved_repr_ = this.formatResolvedAddr_()
    };
    this.addrIndirectY = function() {
        this.readCode_(2);
        var b = this.m.read(this.m.PC + 1);
        this.addr_ = ((this.m.read(b) | (this.m.read((b + 1) & 255) << 8)) + this.m.Y);
        this.addr_repr_ = "($" + cycloa.util.formatHex(b) + "),Y @ $" + cycloa.util.formatHex(this.addr_, 16);
        this.addr_resolved_repr_ = this.formatResolvedAddr_()
    };
    this.addrRelative = function() {
        this.readCode_(2);
        var b = this.m.read(this.m.PC + 1);
        this.addr_ = ((b >= 128 ? (b - 256) : b) + this.m.PC + 2) & 65535;
        this.addr_repr_ = "$" + cycloa.util.formatHex(this.addr_, 16);
        this.addr_resolved_repr_ = ""
    };
    this.LDA = function() {
        return "LDA " + this.addr_repr_ + this.addr_resolved_repr_
    };
    this.LDY = function() {
        return "LDY " + this.addr_repr_ + this.addr_resolved_repr_
    };
    this.LDX = function() {
        return "LDX " + this.addr_repr_ + this.addr_resolved_repr_
    };
    this.STA = function() {
        return "STA " + this.addr_repr_ + this.addr_resolved_repr_
    };
    this.STX = function() {
        return "STX " + this.addr_repr_ + this.addr_resolved_repr_
    };
    this.STY = function() {
        return "STY " + this.addr_repr_ + this.addr_resolved_repr_
    };
    this.TXA_ = function() {
        return "TXA"
    };
    this.TYA_ = function() {
        return "TYA"
    };
    this.TXS_ = function() {
        return "TXS"
    };
    this.TAY_ = function() {
        return "TAY"
    };
    this.TAX_ = function() {
        return "TAX"
    };
    this.TSX_ = function() {
        return "TSX"
    };
    this.PHP_ = function() {
        return "PHP"
    };
    this.PLP_ = function() {
        return "PLP"
    };
    this.PHA_ = function() {
        return "PHA"
    };
    this.PLA_ = function() {
        return "PLA"
    };
    this.ADC = function() {
        return "ADC " + this.addr_repr_ + this.addr_resolved_repr_
    };
    this.SBC = function() {
        return "SBC " + this.addr_repr_ + this.addr_resolved_repr_
    };
    this.CPX = function() {
        return "CPX " + this.addr_repr_ + this.addr_resolved_repr_
    };
    this.CPY = function() {
        return "CPY " + this.addr_repr_ + this.addr_resolved_repr_
    };
    this.CMP = function() {
        return "CMP " + this.addr_repr_ + this.addr_resolved_repr_
    };
    this.AND = function() {
        return "AND " + this.addr_repr_ + this.addr_resolved_repr_
    };
    this.EOR = function() {
        return "EOR " + this.addr_repr_ + this.addr_resolved_repr_
    };
    this.ORA = function() {
        return "ORA " + this.addr_repr_ + this.addr_resolved_repr_
    };
    this.BIT = function() {
        return "BIT " + this.addr_repr_ + this.addr_resolved_repr_
    };
    this.ASL_ = function() {
        return "ASL $registerA"
    };
    this.ASL = function() {
        return "ASL " + this.addr_repr_ + this.addr_resolved_repr_
    };
    this.LSR_ = function() {
        return "LSR $registerA"
    };
    this.LSR = function() {
        return "LSR " + this.addr_repr_ + this.addr_resolved_repr_
    };
    this.ROL_ = function() {
        return "ROL $registerA"
    };
    this.ROL = function() {
        return "ROL " + this.addr_repr_ + this.addr_resolved_repr_
    };
    this.ROR_ = function() {
        return "ROR $registerA"
    };
    this.ROR = function() {
        return "ROR " + this.addr_repr_ + this.addr_resolved_repr_
    };
    this.INX_ = function() {
        return "INX"
    };
    this.INY_ = function() {
        return "INY"
    };
    this.INC = function() {
        return "INC " + this.addr_repr_ + this.addr_resolved_repr_
    };
    this.DEX_ = function() {
        return "DEX"
    };
    this.DEY_ = function() {
        return "DEY"
    };
    this.DEC = function() {
        return "DEC " + this.addr_repr_ + this.addr_resolved_repr_
    };
    this.CLC_ = function() {
        return "CLC"
    };
    this.CLI_ = function() {
        return "CLI"
    };
    this.CLV_ = function() {
        return "CLV"
    };
    this.CLD_ = function() {
        return "CLD"
    };
    this.SEC_ = function() {
        return "SEC"
    };
    this.SEI_ = function() {
        return "SEI"
    };
    this.SED_ = function() {
        return "SED"
    };
    this.NOP_ = function() {
        return "NOP"
    };
    this.BRK_ = function() {
        return "BRK"
    };
    this.BCC = function() {
        return "BCC " + this.addr_repr_
    };
    this.BCS = function() {
        return "BCS " + this.addr_repr_
    };
    this.BEQ = function() {
        return "BEQ " + this.addr_repr_
    };
    this.BNE = function() {
        return "BNE " + this.addr_repr_
    };
    this.BVC = function() {
        return "BVC " + this.addr_repr_
    };
    this.BVS = function() {
        return "BVS " + this.addr_repr_
    };
    this.BPL = function() {
        return "BPL " + this.addr_repr_
    };
    this.BMI = function() {
        return "BMI " + this.addr_repr_
    };
    this.JSR = function() {
        return "JSR " + this.addr_repr_
    };
    this.JMP = function() {
        return "JMP " + this.addr_repr_
    };
    this.RTI_ = function() {
        return "RTI"
    };
    this.RTS_ = function() {
        return "RTS"
    };
    this.onInvalidOpcode = function() {
        return "UNDEFINED"
    };
    this[0] = function() {
        return this.BRK_(this.addrNone())
    };
    this[1] = function() {
        return this.ORA(this.addrIndirectX())
    };
    this[2] = function() {
        return this.onInvalidOpcode()
    };
    this[3] = function() {
        return this.onInvalidOpcode()
    };
    this[4] = function() {
        return this.onInvalidOpcode()
    };
    this[5] = function() {
        return this.ORA(this.addrZeropage())
    };
    this[6] = function() {
        return this.ASL(this.addrZeropage())
    };
    this[7] = function() {
        return this.onInvalidOpcode()
    };
    this[8] = function() {
        return this.PHP_(this.addrNone())
    };
    this[9] = function() {
        return this.ORA(this.addrImmediate())
    };
    this[10] = function() {
        return this.ASL_(this.addrNone())
    };
    this[11] = function() {
        return this.onInvalidOpcode()
    };
    this[12] = function() {
        return this.onInvalidOpcode()
    };
    this[13] = function() {
        return this.ORA(this.addrAbsolute())
    };
    this[14] = function() {
        return this.ASL(this.addrAbsolute())
    };
    this[15] = function() {
        return this.onInvalidOpcode()
    };
    this[16] = function() {
        return this.BPL(this.addrRelative())
    };
    this[17] = function() {
        return this.ORA(this.addrIndirectY())
    };
    this[18] = function() {
        return this.onInvalidOpcode()
    };
    this[19] = function() {
        return this.onInvalidOpcode()
    };
    this[20] = function() {
        return this.onInvalidOpcode()
    };
    this[21] = function() {
        return this.ORA(this.addrZeropageX())
    };
    this[22] = function() {
        return this.ASL(this.addrZeropageX())
    };
    this[23] = function() {
        return this.onInvalidOpcode()
    };
    this[24] = function() {
        return this.CLC_(this.addrNone())
    };
    this[25] = function() {
        return this.ORA(this.addrAbsoluteY())
    };
    this[26] = function() {
        return this.onInvalidOpcode()
    };
    this[27] = function() {
        return this.onInvalidOpcode()
    };
    this[28] = function() {
        return this.onInvalidOpcode()
    };
    this[29] = function() {
        return this.ORA(this.addrAbsoluteX())
    };
    this[30] = function() {
        return this.ASL(this.addrAbsoluteX())
    };
    this[31] = function() {
        return this.onInvalidOpcode()
    };
    this[32] = function() {
        return this.JSR(this.addrAbsolute())
    };
    this[33] = function() {
        return this.AND(this.addrIndirectX())
    };
    this[34] = function() {
        return this.onInvalidOpcode()
    };
    this[35] = function() {
        return this.onInvalidOpcode()
    };
    this[36] = function() {
        return this.BIT(this.addrZeropage())
    };
    this[37] = function() {
        return this.AND(this.addrZeropage())
    };
    this[38] = function() {
        return this.ROL(this.addrZeropage())
    };
    this[39] = function() {
        return this.onInvalidOpcode()
    };
    this[40] = function() {
        return this.PLP_(this.addrNone())
    };
    this[41] = function() {
        return this.AND(this.addrImmediate())
    };
    this[42] = function() {
        return this.ROL_(this.addrNone())
    };
    this[43] = function() {
        return this.onInvalidOpcode()
    };
    this[44] = function() {
        return this.BIT(this.addrAbsolute())
    };
    this[45] = function() {
        return this.AND(this.addrAbsolute())
    };
    this[46] = function() {
        return this.ROL(this.addrAbsolute())
    };
    this[47] = function() {
        return this.onInvalidOpcode()
    };
    this[48] = function() {
        return this.BMI(this.addrRelative())
    };
    this[49] = function() {
        return this.AND(this.addrIndirectY())
    };
    this[50] = function() {
        return this.onInvalidOpcode()
    };
    this[51] = function() {
        return this.onInvalidOpcode()
    };
    this[52] = function() {
        return this.onInvalidOpcode()
    };
    this[53] = function() {
        return this.AND(this.addrZeropageX())
    };
    this[54] = function() {
        return this.ROL(this.addrZeropageX())
    };
    this[55] = function() {
        return this.onInvalidOpcode()
    };
    this[56] = function() {
        return this.SEC_(this.addrNone())
    };
    this[57] = function() {
        return this.AND(this.addrAbsoluteY())
    };
    this[58] = function() {
        return this.onInvalidOpcode()
    };
    this[59] = function() {
        return this.onInvalidOpcode()
    };
    this[60] = function() {
        return this.onInvalidOpcode()
    };
    this[61] = function() {
        return this.AND(this.addrAbsoluteX())
    };
    this[62] = function() {
        return this.ROL(this.addrAbsoluteX())
    };
    this[63] = function() {
        return this.onInvalidOpcode()
    };
    this[64] = function() {
        return this.RTI_(this.addrNone())
    };
    this[65] = function() {
        return this.EOR(this.addrIndirectX())
    };
    this[66] = function() {
        return this.onInvalidOpcode()
    };
    this[67] = function() {
        return this.onInvalidOpcode()
    };
    this[68] = function() {
        return this.onInvalidOpcode()
    };
    this[69] = function() {
        return this.EOR(this.addrZeropage())
    };
    this[70] = function() {
        return this.LSR(this.addrZeropage())
    };
    this[71] = function() {
        return this.onInvalidOpcode()
    };
    this[72] = function() {
        return this.PHA_(this.addrNone())
    };
    this[73] = function() {
        return this.EOR(this.addrImmediate())
    };
    this[74] = function() {
        return this.LSR_(this.addrNone())
    };
    this[75] = function() {
        return this.onInvalidOpcode()
    };
    this[76] = function() {
        return this.JMP(this.addrAbsolute())
    };
    this[77] = function() {
        return this.EOR(this.addrAbsolute())
    };
    this[78] = function() {
        return this.LSR(this.addrAbsolute())
    };
    this[79] = function() {
        return this.onInvalidOpcode()
    };
    this[80] = function() {
        return this.BVC(this.addrRelative())
    };
    this[81] = function() {
        return this.EOR(this.addrIndirectY())
    };
    this[82] = function() {
        return this.onInvalidOpcode()
    };
    this[83] = function() {
        return this.onInvalidOpcode()
    };
    this[84] = function() {
        return this.onInvalidOpcode()
    };
    this[85] = function() {
        return this.EOR(this.addrZeropageX())
    };
    this[86] = function() {
        return this.LSR(this.addrZeropageX())
    };
    this[87] = function() {
        return this.onInvalidOpcode()
    };
    this[88] = function() {
        return this.CLI_(this.addrNone())
    };
    this[89] = function() {
        return this.EOR(this.addrAbsoluteY())
    };
    this[90] = function() {
        return this.onInvalidOpcode()
    };
    this[91] = function() {
        return this.onInvalidOpcode()
    };
    this[92] = function() {
        return this.onInvalidOpcode()
    };
    this[93] = function() {
        return this.EOR(this.addrAbsoluteX())
    };
    this[94] = function() {
        return this.LSR(this.addrAbsoluteX())
    };
    this[95] = function() {
        return this.onInvalidOpcode()
    };
    this[96] = function() {
        return this.RTS_(this.addrNone())
    };
    this[97] = function() {
        return this.ADC(this.addrIndirectX())
    };
    this[98] = function() {
        return this.onInvalidOpcode()
    };
    this[99] = function() {
        return this.onInvalidOpcode()
    };
    this[100] = function() {
        return this.onInvalidOpcode()
    };
    this[101] = function() {
        return this.ADC(this.addrZeropage())
    };
    this[102] = function() {
        return this.ROR(this.addrZeropage())
    };
    this[103] = function() {
        return this.onInvalidOpcode()
    };
    this[104] = function() {
        return this.PLA_(this.addrNone())
    };
    this[105] = function() {
        return this.ADC(this.addrImmediate())
    };
    this[106] = function() {
        return this.ROR_(this.addrNone())
    };
    this[107] = function() {
        return this.onInvalidOpcode()
    };
    this[108] = function() {
        return this.JMP(this.addrIndirect())
    };
    this[109] = function() {
        return this.ADC(this.addrAbsolute())
    };
    this[110] = function() {
        return this.ROR(this.addrAbsolute())
    };
    this[111] = function() {
        return this.onInvalidOpcode()
    };
    this[112] = function() {
        return this.BVS(this.addrRelative())
    };
    this[113] = function() {
        return this.ADC(this.addrIndirectY())
    };
    this[114] = function() {
        return this.onInvalidOpcode()
    };
    this[115] = function() {
        return this.onInvalidOpcode()
    };
    this[116] = function() {
        return this.onInvalidOpcode()
    };
    this[117] = function() {
        return this.ADC(this.addrZeropageX())
    };
    this[118] = function() {
        return this.ROR(this.addrZeropageX())
    };
    this[119] = function() {
        return this.onInvalidOpcode()
    };
    this[120] = function() {
        return this.SEI_(this.addrNone())
    };
    this[121] = function() {
        return this.ADC(this.addrAbsoluteY())
    };
    this[122] = function() {
        return this.onInvalidOpcode()
    };
    this[123] = function() {
        return this.onInvalidOpcode()
    };
    this[124] = function() {
        return this.onInvalidOpcode()
    };
    this[125] = function() {
        return this.ADC(this.addrAbsoluteX())
    };
    this[126] = function() {
        return this.ROR(this.addrAbsoluteX())
    };
    this[127] = function() {
        return this.onInvalidOpcode()
    };
    this[128] = function() {
        return this.onInvalidOpcode()
    };
    this[129] = function() {
        return this.STA(this.addrIndirectX())
    };
    this[130] = function() {
        return this.onInvalidOpcode()
    };
    this[131] = function() {
        return this.onInvalidOpcode()
    };
    this[132] = function() {
        return this.STY(this.addrZeropage())
    };
    this[133] = function() {
        return this.STA(this.addrZeropage())
    };
    this[134] = function() {
        return this.STX(this.addrZeropage())
    };
    this[135] = function() {
        return this.onInvalidOpcode()
    };
    this[136] = function() {
        return this.DEY_(this.addrNone())
    };
    this[137] = function() {
        return this.onInvalidOpcode()
    };
    this[138] = function() {
        return this.TXA_(this.addrNone())
    };
    this[139] = function() {
        return this.onInvalidOpcode()
    };
    this[140] = function() {
        return this.STY(this.addrAbsolute())
    };
    this[141] = function() {
        return this.STA(this.addrAbsolute())
    };
    this[142] = function() {
        return this.STX(this.addrAbsolute())
    };
    this[143] = function() {
        return this.onInvalidOpcode()
    };
    this[144] = function() {
        return this.BCC(this.addrRelative())
    };
    this[145] = function() {
        return this.STA(this.addrIndirectY())
    };
    this[146] = function() {
        return this.onInvalidOpcode()
    };
    this[147] = function() {
        return this.onInvalidOpcode()
    };
    this[148] = function() {
        return this.STY(this.addrZeropageX())
    };
    this[149] = function() {
        return this.STA(this.addrZeropageX())
    };
    this[150] = function() {
        return this.STX(this.addrZeropageY())
    };
    this[151] = function() {
        return this.onInvalidOpcode()
    };
    this[152] = function() {
        return this.TYA_(this.addrNone())
    };
    this[153] = function() {
        return this.STA(this.addrAbsoluteY())
    };
    this[154] = function() {
        return this.TXS_(this.addrNone())
    };
    this[155] = function() {
        return this.onInvalidOpcode()
    };
    this[156] = function() {
        return this.onInvalidOpcode()
    };
    this[157] = function() {
        return this.STA(this.addrAbsoluteX())
    };
    this[158] = function() {
        return this.onInvalidOpcode()
    };
    this[159] = function() {
        return this.onInvalidOpcode()
    };
    this[160] = function() {
        return this.LDY(this.addrImmediate())
    };
    this[161] = function() {
        return this.LDA(this.addrIndirectX())
    };
    this[162] = function() {
        return this.LDX(this.addrImmediate())
    };
    this[163] = function() {
        return this.onInvalidOpcode()
    };
    this[164] = function() {
        return this.LDY(this.addrZeropage())
    };
    this[165] = function() {
        return this.LDA(this.addrZeropage())
    };
    this[166] = function() {
        return this.LDX(this.addrZeropage())
    };
    this[167] = function() {
        return this.onInvalidOpcode()
    };
    this[168] = function() {
        return this.TAY_(this.addrNone())
    };
    this[169] = function() {
        return this.LDA(this.addrImmediate())
    };
    this[170] = function() {
        return this.TAX_(this.addrNone())
    };
    this[171] = function() {
        return this.onInvalidOpcode()
    };
    this[172] = function() {
        return this.LDY(this.addrAbsolute())
    };
    this[173] = function() {
        return this.LDA(this.addrAbsolute())
    };
    this[174] = function() {
        return this.LDX(this.addrAbsolute())
    };
    this[175] = function() {
        return this.onInvalidOpcode()
    };
    this[176] = function() {
        return this.BCS(this.addrRelative())
    };
    this[177] = function() {
        return this.LDA(this.addrIndirectY())
    };
    this[178] = function() {
        return this.onInvalidOpcode()
    };
    this[179] = function() {
        return this.onInvalidOpcode()
    };
    this[180] = function() {
        return this.LDY(this.addrZeropageX())
    };
    this[181] = function() {
        return this.LDA(this.addrZeropageX())
    };
    this[182] = function() {
        return this.LDX(this.addrZeropageY())
    };
    this[183] = function() {
        return this.onInvalidOpcode()
    };
    this[184] = function() {
        return this.CLV_(this.addrNone())
    };
    this[185] = function() {
        return this.LDA(this.addrAbsoluteY())
    };
    this[186] = function() {
        return this.TSX_(this.addrNone())
    };
    this[187] = function() {
        return this.onInvalidOpcode()
    };
    this[188] = function() {
        return this.LDY(this.addrAbsoluteX())
    };
    this[189] = function() {
        return this.LDA(this.addrAbsoluteX())
    };
    this[190] = function() {
        return this.LDX(this.addrAbsoluteY())
    };
    this[191] = function() {
        return this.onInvalidOpcode()
    };
    this[192] = function() {
        return this.CPY(this.addrImmediate())
    };
    this[193] = function() {
        return this.CMP(this.addrIndirectX())
    };
    this[194] = function() {
        return this.onInvalidOpcode()
    };
    this[195] = function() {
        return this.onInvalidOpcode()
    };
    this[196] = function() {
        return this.CPY(this.addrZeropage())
    };
    this[197] = function() {
        return this.CMP(this.addrZeropage())
    };
    this[198] = function() {
        return this.DEC(this.addrZeropage())
    };
    this[199] = function() {
        return this.onInvalidOpcode()
    };
    this[200] = function() {
        return this.INY_(this.addrNone())
    };
    this[201] = function() {
        return this.CMP(this.addrImmediate())
    };
    this[202] = function() {
        return this.DEX_(this.addrNone())
    };
    this[203] = function() {
        return this.onInvalidOpcode()
    };
    this[204] = function() {
        return this.CPY(this.addrAbsolute())
    };
    this[205] = function() {
        return this.CMP(this.addrAbsolute())
    };
    this[206] = function() {
        return this.DEC(this.addrAbsolute())
    };
    this[207] = function() {
        return this.onInvalidOpcode()
    };
    this[208] = function() {
        return this.BNE(this.addrRelative())
    };
    this[209] = function() {
        return this.CMP(this.addrIndirectY())
    };
    this[210] = function() {
        return this.onInvalidOpcode()
    };
    this[211] = function() {
        return this.onInvalidOpcode()
    };
    this[212] = function() {
        return this.onInvalidOpcode()
    };
    this[213] = function() {
        return this.CMP(this.addrZeropageX())
    };
    this[214] = function() {
        return this.DEC(this.addrZeropageX())
    };
    this[215] = function() {
        return this.onInvalidOpcode()
    };
    this[216] = function() {
        return this.CLD_(this.addrNone())
    };
    this[217] = function() {
        return this.CMP(this.addrAbsoluteY())
    };
    this[218] = function() {
        return this.onInvalidOpcode()
    };
    this[219] = function() {
        return this.onInvalidOpcode()
    };
    this[220] = function() {
        return this.onInvalidOpcode()
    };
    this[221] = function() {
        return this.CMP(this.addrAbsoluteX())
    };
    this[222] = function() {
        return this.DEC(this.addrAbsoluteX())
    };
    this[223] = function() {
        return this.onInvalidOpcode()
    };
    this[224] = function() {
        return this.CPX(this.addrImmediate())
    };
    this[225] = function() {
        return this.SBC(this.addrIndirectX())
    };
    this[226] = function() {
        return this.onInvalidOpcode()
    };
    this[227] = function() {
        return this.onInvalidOpcode()
    };
    this[228] = function() {
        return this.CPX(this.addrZeropage())
    };
    this[229] = function() {
        return this.SBC(this.addrZeropage())
    };
    this[230] = function() {
        return this.INC(this.addrZeropage())
    };
    this[231] = function() {
        return this.onInvalidOpcode()
    };
    this[232] = function() {
        return this.INX_(this.addrNone())
    };
    this[233] = function() {
        return this.SBC(this.addrImmediate())
    };
    this[234] = function() {
        return this.NOP_(this.addrNone())
    };
    this[235] = function() {
        return this.onInvalidOpcode()
    };
    this[236] = function() {
        return this.CPX(this.addrAbsolute())
    };
    this[237] = function() {
        return this.SBC(this.addrAbsolute())
    };
    this[238] = function() {
        return this.INC(this.addrAbsolute())
    };
    this[239] = function() {
        return this.onInvalidOpcode()
    };
    this[240] = function() {
        return this.BEQ(this.addrRelative())
    };
    this[241] = function() {
        return this.SBC(this.addrIndirectY())
    };
    this[242] = function() {
        return this.onInvalidOpcode()
    };
    this[243] = function() {
        return this.onInvalidOpcode()
    };
    this[244] = function() {
        return this.onInvalidOpcode()
    };
    this[245] = function() {
        return this.SBC(this.addrZeropageX())
    };
    this[246] = function() {
        return this.INC(this.addrZeropageX())
    };
    this[247] = function() {
        return this.onInvalidOpcode()
    };
    this[248] = function() {
        return this.SED_(this.addrNone())
    };
    this[249] = function() {
        return this.SBC(this.addrAbsoluteY())
    };
    this[250] = function() {
        return this.onInvalidOpcode()
    };
    this[251] = function() {
        return this.onInvalidOpcode()
    };
    this[252] = function() {
        return this.onInvalidOpcode()
    };
    this[253] = function() {
        return this.SBC(this.addrAbsoluteX())
    };
    this[254] = function() {
        return this.INC(this.addrAbsoluteX())
    };
    this[255] = function() {
        return this.onInvalidOpcode()
    }
};
cycloa.AbstractAudioFairy = function() {
    this.enabled = false;
    this.data = undefined;
    this.dataLength = 0;
    this.dataIndex = undefined
};
cycloa.AbstractAudioFairy.prototype.onDataFilled = function() {};
cycloa.AbstractVideoFairy = function() {
    this.dispatchRendering = function(a, b) {}
};
cycloa.AbstractPadFairy = function() {};
cycloa.AbstractPadFairy.prototype.A = 0;
cycloa.AbstractPadFairy.prototype.B = 1;
cycloa.AbstractPadFairy.prototype.SELECT = 2;
cycloa.AbstractPadFairy.prototype.START = 3;
cycloa.AbstractPadFairy.prototype.UP = 4;
cycloa.AbstractPadFairy.prototype.DOWN = 5;
cycloa.AbstractPadFairy.prototype.LEFT = 6;
cycloa.AbstractPadFairy.prototype.RIGHT = 7;
cycloa.AbstractPadFairy.prototype.TOTAL = 8;
cycloa.AbstractPadFairy.prototype.MASK_A = 1;
cycloa.AbstractPadFairy.prototype.MASK_B = 2;
cycloa.AbstractPadFairy.prototype.MASK_SELECT = 4;
cycloa.AbstractPadFairy.prototype.MASK_START = 8;
cycloa.AbstractPadFairy.prototype.MASK_UP = 16;
cycloa.AbstractPadFairy.prototype.MASK_DOWN = 32;
cycloa.AbstractPadFairy.prototype.MASK_LEFT = 64;
cycloa.AbstractPadFairy.prototype.MASK_RIGHT = 128;
cycloa.AbstractPadFairy.prototype.MASK_ALL = 255;
cycloa.AbstractPadFairy.prototype.state = 0;
cycloa.VirtualMachine = function(b, e, c, a) {
    this.tracer = new cycloa.Tracer(this);
    this.A = 0;
    this.X = 0;
    this.Y = 0;
    this.PC = 0;
    this.SP = 0;
    this.P = 0;
    this.__cpu__ram = new Uint8Array(new ArrayBuffer(2048));
    this.__cpu__rom = new Array(32);
    this.__cpu__ZNFlagCache = cycloa.VirtualMachine.ZNFlagCache;
    this.__cpu__TransTable = cycloa.VirtualMachine.TransTable;
    this.__video__videoFairy = b;
    this.__video__isEven = false;
    this.__video__nowY = 0;
    this.__video__nowX = 0;
    this.__video__spriteHitCnt = 0;
    this.__video__executeNMIonVBlank = false;
    this.__video__spriteHeight = 8;
    this.__video__patternTableAddressBackground = 0;
    this.__video__patternTableAddress8x8Sprites = 0;
    this.__video__vramIncrementSize = 1;
    this.__video__colorEmphasis = 0;
    this.__video__spriteVisibility = false;
    this.__video__backgroundVisibility = false;
    this.__video__spriteClipping = false;
    this.__video__backgroundClipping = false;
    this.__video__paletteMask = 0;
    this.__video__nowOnVBnank = false;
    this.__video__sprite0Hit = false;
    this.__video__lostSprites = false;
    this.__video__vramBuffer = 0;
    this.__video__spriteAddr = 0;
    this.__video__vramAddrRegister = 0;
    this.__video__vramAddrReloadRegister = 0;
    this.__video__horizontalScrollBits = 0;
    this.__video__scrollRegisterWritten = false;
    this.__video__vramAddrRegisterWritten = false;
    this.__video__screenBuffer = new ArrayBuffer(256 * 240);
    this.__video__screenBuffer8 = new Uint8Array(this.__video__screenBuffer);
    this.__video__screenBuffer32 = new Uint32Array(this.__video__screenBuffer);
    this.__video__spRam = new Uint8Array(256);
    this.__video__palette = new Uint8Array(9 * 4);
    this.__video__spriteTable = new Array(8);
    for (var d = 0; d < 8; ++d) {
        this.__video__spriteTable[d] = {}
    }
    this.__video__pattern = new Array(16);
    this.__video__vramMirroring = new Array(4);
    this.__video__internalVram = new Array(4);
    for (var d = 0; d < 4; ++d) {
        this.__video__internalVram[d] = new Uint8Array(1024)
    }
    this.__audio__audioFairy = e;
    this.__audio__LengthCounterConst = cycloa.VirtualMachine.LengthCounterConst;
    this.__triangle__waveForm = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
    this.__noize__FrequencyTable = [4, 8, 16, 32, 64, 96, 128, 160, 202, 254, 380, 508, 762, 1016, 2034, 4068];
    this.__digital__FrequencyTable = [428, 380, 340, 320, 286, 254, 226, 214, 190, 160, 142, 128, 106, 84, 72, 54];
    this.__pad__pad1Fairy = c || new cycloa.AbstractPadFairy();
    this.__pad__pad2Fairy = a || new cycloa.AbstractPadFairy();
    this.__pad__pad1Idx = 0;
    this.__pad__pad2Idx = 0;
    this.__vm__reservedClockDelta = 0;
    this.NMI = false;
    this.IRQ = false
};
cycloa.VirtualMachine.prototype.run = function() {
    var H = this.__cpu__ZNFlagCache;
    var L = this.__cpu__TransTable;
    var d = this.__cpu__rom;
    var R = this.__cpu__ram;
    var al = this.__video__palette;
    var aq = this.__video__vramMirroring;
    var o = this.__video__pattern;
    var ab = this.__video__screenBuffer8;
    var am = this.__video__screenBuffer32;
    var at = this.__audio__audioFairy;
    var c = at.enabled;
    var M = at.data;
    var k = at.dataLength;
    var ao = true;
    var aa;
    var ai = this.__vm__reservedClockDelta;
    this.__vm__reservedClockDelta = 0;
    while (ao) {
        aa = ai;
        ai = 0;
        this.P |= 32;
        if (this.NMI) {
            aa += (7);
            this.P &= 239;
            R[256 | (this.SP-- & 255)] = this.PC >> 8;
            R[256 | (this.SP-- & 255)] = this.PC;
            R[256 | (this.SP-- & 255)] = this.P;
            this.P |= 4;
            this.PC = (this.__cpu__rom[31][1018] | (this.__cpu__rom[31][1019] << 8));
            this.NMI = false
        } else {
            if (this.IRQ) {
                this.onIRQ();
                if ((this.P & 4) !== 4) {
                    aa += (7);
                    this.P &= 239;
                    R[256 | (this.SP-- & 255)] = this.PC >> 8;
                    R[256 | (this.SP-- & 255)] = this.PC;
                    R[256 | (this.SP-- & 255)] = this.P;
                    this.P |= 4;
                    this.PC = (this.__cpu__rom[31][1022] | (this.__cpu__rom[31][1023] << 8))
                }
            }
        } if (this.needStatusRewrite) {
            this.P = this.newStatus;
            this.needStatusRewrite = false
        }
        var E = this.PC;
        var Z;
        switch ((E & 57344) >> 13) {
            case 0:
                Z = R[E & 2047];
                break;
            case 1:
                Z = this.__video__readReg(E);
                break;
            case 2:
                if (E === 16405) {
                    Z = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                    this.IRQ &= 254;
                    this.IRQ &= 253
                } else {
                    if (E === 16406) {
                        Z = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                    } else {
                        if (E === 16407) {
                            Z = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                        } else {
                            if (addr < 16408) {
                                throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + E.toString(16))
                            } else {
                                Z = this.readMapperRegisterArea(addr)
                            }
                        }
                    }
                }
                break;
            case 3:
                Z = 0;
                break;
            case 4:
                Z = d[(E >> 10) & 31][E & 1023];
                break;
            case 5:
                Z = d[(E >> 10) & 31][E & 1023];
                break;
            case 6:
                Z = d[(E >> 10) & 31][E & 1023];
                break;
            case 7:
                Z = d[(E >> 10) & 31][E & 1023];
                break
        }
        var j = L[Z];
        switch (j & 15) {
            case 0:
                var ak = (E + 1);
                this.PC = E + 2;
                break;
            case 1:
                var av = E + 1;
                var ak;
                switch ((av & 57344) >> 13) {
                    case 0:
                        ak = R[av & 2047];
                        break;
                    case 1:
                        ak = this.__video__readReg(av);
                        break;
                    case 2:
                        if (av === 16405) {
                            ak = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (av === 16406) {
                                ak = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (av === 16407) {
                                    ak = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + av.toString(16))
                                    } else {
                                        ak = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        ak = 0;
                        break;
                    case 4:
                        ak = d[(av >> 10) & 31][av & 1023];
                        break;
                    case 5:
                        ak = d[(av >> 10) & 31][av & 1023];
                        break;
                    case 6:
                        ak = d[(av >> 10) & 31][av & 1023];
                        break;
                    case 7:
                        ak = d[(av >> 10) & 31][av & 1023];
                        break
                }
                this.PC = E + 2;
                break;
            case 2:
                var av = E + 1;
                switch ((av & 57344) >> 13) {
                    case 0:
                        av = R[av & 2047];
                        break;
                    case 1:
                        av = this.__video__readReg(av);
                        break;
                    case 2:
                        if (av === 16405) {
                            av = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (av === 16406) {
                                av = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (av === 16407) {
                                    av = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + av.toString(16))
                                    } else {
                                        av = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        av = 0;
                        break;
                    case 4:
                        av = d[(av >> 10) & 31][av & 1023];
                        break;
                    case 5:
                        av = d[(av >> 10) & 31][av & 1023];
                        break;
                    case 6:
                        av = d[(av >> 10) & 31][av & 1023];
                        break;
                    case 7:
                        av = d[(av >> 10) & 31][av & 1023];
                        break
                }
                var ak = (av + this.X) & 255;
                this.PC = E + 2;
                break;
            case 3:
                var av = E + 1;
                switch ((av & 57344) >> 13) {
                    case 0:
                        av = R[av & 2047];
                        break;
                    case 1:
                        av = this.__video__readReg(av);
                        break;
                    case 2:
                        if (av === 16405) {
                            av = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (av === 16406) {
                                av = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (av === 16407) {
                                    av = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + av.toString(16))
                                    } else {
                                        av = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        av = 0;
                        break;
                    case 4:
                        av = d[(av >> 10) & 31][av & 1023];
                        break;
                    case 5:
                        av = d[(av >> 10) & 31][av & 1023];
                        break;
                    case 6:
                        av = d[(av >> 10) & 31][av & 1023];
                        break;
                    case 7:
                        av = d[(av >> 10) & 31][av & 1023];
                        break
                }
                var ak = (av + this.Y) & 255;
                this.PC = E + 2;
                break;
            case 4:
                var t = E + 1;
                switch ((t & 57344) >> 13) {
                    case 0:
                        t = R[t & 2047];
                        break;
                    case 1:
                        t = this.__video__readReg(t);
                        break;
                    case 2:
                        if (t === 16405) {
                            t = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (t === 16406) {
                                t = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (t === 16407) {
                                    t = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + t.toString(16))
                                    } else {
                                        t = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        t = 0;
                        break;
                    case 4:
                        t = d[(t >> 10) & 31][t & 1023];
                        break;
                    case 5:
                        t = d[(t >> 10) & 31][t & 1023];
                        break;
                    case 6:
                        t = d[(t >> 10) & 31][t & 1023];
                        break;
                    case 7:
                        t = d[(t >> 10) & 31][t & 1023];
                        break
                }
                var s = E + 2;
                switch ((s & 57344) >> 13) {
                    case 0:
                        s = R[s & 2047];
                        break;
                    case 1:
                        s = this.__video__readReg(s);
                        break;
                    case 2:
                        if (s === 16405) {
                            s = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (s === 16406) {
                                s = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (s === 16407) {
                                    s = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + s.toString(16))
                                    } else {
                                        s = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        s = 0;
                        break;
                    case 4:
                        s = d[(s >> 10) & 31][s & 1023];
                        break;
                    case 5:
                        s = d[(s >> 10) & 31][s & 1023];
                        break;
                    case 6:
                        s = d[(s >> 10) & 31][s & 1023];
                        break;
                    case 7:
                        s = d[(s >> 10) & 31][s & 1023];
                        break
                }
                var ak = (t | (s << 8));
                this.PC = E + 3;
                break;
            case 5:
                var t = E + 1;
                switch ((t & 57344) >> 13) {
                    case 0:
                        t = R[t & 2047];
                        break;
                    case 1:
                        t = this.__video__readReg(t);
                        break;
                    case 2:
                        if (t === 16405) {
                            t = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (t === 16406) {
                                t = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (t === 16407) {
                                    t = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + t.toString(16))
                                    } else {
                                        t = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        t = 0;
                        break;
                    case 4:
                        t = d[(t >> 10) & 31][t & 1023];
                        break;
                    case 5:
                        t = d[(t >> 10) & 31][t & 1023];
                        break;
                    case 6:
                        t = d[(t >> 10) & 31][t & 1023];
                        break;
                    case 7:
                        t = d[(t >> 10) & 31][t & 1023];
                        break
                }
                var s = E + 2;
                switch ((s & 57344) >> 13) {
                    case 0:
                        s = R[s & 2047];
                        break;
                    case 1:
                        s = this.__video__readReg(s);
                        break;
                    case 2:
                        if (s === 16405) {
                            s = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (s === 16406) {
                                s = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (s === 16407) {
                                    s = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + s.toString(16))
                                    } else {
                                        s = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        s = 0;
                        break;
                    case 4:
                        s = d[(s >> 10) & 31][s & 1023];
                        break;
                    case 5:
                        s = d[(s >> 10) & 31][s & 1023];
                        break;
                    case 6:
                        s = d[(s >> 10) & 31][s & 1023];
                        break;
                    case 7:
                        s = d[(s >> 10) & 31][s & 1023];
                        break
                }
                var ak = (t | (s << 8)) + this.X;
                if (((ak ^ av) & 256) !== 0) {
                    aa += (1)
                }
                this.PC = E + 3;
                break;
            case 6:
                var t = E + 1;
                switch ((t & 57344) >> 13) {
                    case 0:
                        t = R[t & 2047];
                        break;
                    case 1:
                        t = this.__video__readReg(t);
                        break;
                    case 2:
                        if (t === 16405) {
                            t = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (t === 16406) {
                                t = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (t === 16407) {
                                    t = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + t.toString(16))
                                    } else {
                                        t = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        t = 0;
                        break;
                    case 4:
                        t = d[(t >> 10) & 31][t & 1023];
                        break;
                    case 5:
                        t = d[(t >> 10) & 31][t & 1023];
                        break;
                    case 6:
                        t = d[(t >> 10) & 31][t & 1023];
                        break;
                    case 7:
                        t = d[(t >> 10) & 31][t & 1023];
                        break
                }
                var s = E + 2;
                switch ((s & 57344) >> 13) {
                    case 0:
                        s = R[s & 2047];
                        break;
                    case 1:
                        s = this.__video__readReg(s);
                        break;
                    case 2:
                        if (s === 16405) {
                            s = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (s === 16406) {
                                s = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (s === 16407) {
                                    s = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + s.toString(16))
                                    } else {
                                        s = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        s = 0;
                        break;
                    case 4:
                        s = d[(s >> 10) & 31][s & 1023];
                        break;
                    case 5:
                        s = d[(s >> 10) & 31][s & 1023];
                        break;
                    case 6:
                        s = d[(s >> 10) & 31][s & 1023];
                        break;
                    case 7:
                        s = d[(s >> 10) & 31][s & 1023];
                        break
                }
                var ak = (t | (s << 8)) + this.Y;
                if (((ak ^ av) & 256) !== 0) {
                    aa += (1)
                }
                this.PC = E + 3;
                break;
            case 7:
                var t = E + 1;
                switch ((t & 57344) >> 13) {
                    case 0:
                        t = R[t & 2047];
                        break;
                    case 1:
                        t = this.__video__readReg(t);
                        break;
                    case 2:
                        if (t === 16405) {
                            t = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (t === 16406) {
                                t = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (t === 16407) {
                                    t = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + t.toString(16))
                                    } else {
                                        t = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        t = 0;
                        break;
                    case 4:
                        t = d[(t >> 10) & 31][t & 1023];
                        break;
                    case 5:
                        t = d[(t >> 10) & 31][t & 1023];
                        break;
                    case 6:
                        t = d[(t >> 10) & 31][t & 1023];
                        break;
                    case 7:
                        t = d[(t >> 10) & 31][t & 1023];
                        break
                }
                var s = E + 2;
                switch ((s & 57344) >> 13) {
                    case 0:
                        s = R[s & 2047];
                        break;
                    case 1:
                        s = this.__video__readReg(s);
                        break;
                    case 2:
                        if (s === 16405) {
                            s = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (s === 16406) {
                                s = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (s === 16407) {
                                    s = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + s.toString(16))
                                    } else {
                                        s = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        s = 0;
                        break;
                    case 4:
                        s = d[(s >> 10) & 31][s & 1023];
                        break;
                    case 5:
                        s = d[(s >> 10) & 31][s & 1023];
                        break;
                    case 6:
                        s = d[(s >> 10) & 31][s & 1023];
                        break;
                    case 7:
                        s = d[(s >> 10) & 31][s & 1023];
                        break
                }
                var r = (t | (s << 8));
                var q;
                switch ((r & 57344) >> 13) {
                    case 0:
                        q = R[r & 2047];
                        break;
                    case 1:
                        q = this.__video__readReg(r);
                        break;
                    case 2:
                        if (r === 16405) {
                            q = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (r === 16406) {
                                q = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (r === 16407) {
                                    q = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + r.toString(16))
                                    } else {
                                        q = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        q = 0;
                        break;
                    case 4:
                        q = d[(r >> 10) & 31][r & 1023];
                        break;
                    case 5:
                        q = d[(r >> 10) & 31][r & 1023];
                        break;
                    case 6:
                        q = d[(r >> 10) & 31][r & 1023];
                        break;
                    case 7:
                        q = d[(r >> 10) & 31][r & 1023];
                        break
                }
                var m = (r & 65280) | ((r + 1) & 255);
                switch ((m & 57344) >> 13) {
                    case 0:
                        m = R[m & 2047];
                        break;
                    case 1:
                        m = this.__video__readReg(m);
                        break;
                    case 2:
                        if (m === 16405) {
                            m = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (m === 16406) {
                                m = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (m === 16407) {
                                    m = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + m.toString(16))
                                    } else {
                                        m = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        m = 0;
                        break;
                    case 4:
                        m = d[(m >> 10) & 31][m & 1023];
                        break;
                    case 5:
                        m = d[(m >> 10) & 31][m & 1023];
                        break;
                    case 6:
                        m = d[(m >> 10) & 31][m & 1023];
                        break;
                    case 7:
                        m = d[(m >> 10) & 31][m & 1023];
                        break
                }
                var ak = q | (m << 8);
                this.PC = E + 3;
                break;
            case 8:
                var av = E + 1;
                switch ((av & 57344) >> 13) {
                    case 0:
                        av = R[av & 2047];
                        break;
                    case 1:
                        av = this.__video__readReg(av);
                        break;
                    case 2:
                        if (av === 16405) {
                            av = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (av === 16406) {
                                av = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (av === 16407) {
                                    av = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + av.toString(16))
                                    } else {
                                        av = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        av = 0;
                        break;
                    case 4:
                        av = d[(av >> 10) & 31][av & 1023];
                        break;
                    case 5:
                        av = d[(av >> 10) & 31][av & 1023];
                        break;
                    case 6:
                        av = d[(av >> 10) & 31][av & 1023];
                        break;
                    case 7:
                        av = d[(av >> 10) & 31][av & 1023];
                        break
                }
                av = (av + this.X) & 255;
                var ak = R[av] | (R[(av + 1) & 255] << 8);
                this.PC = E + 2;
                break;
            case 9:
                var av = E + 1;
                switch ((av & 57344) >> 13) {
                    case 0:
                        av = R[av & 2047];
                        break;
                    case 1:
                        av = this.__video__readReg(av);
                        break;
                    case 2:
                        if (av === 16405) {
                            av = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (av === 16406) {
                                av = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (av === 16407) {
                                    av = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + av.toString(16))
                                    } else {
                                        av = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        av = 0;
                        break;
                    case 4:
                        av = d[(av >> 10) & 31][av & 1023];
                        break;
                    case 5:
                        av = d[(av >> 10) & 31][av & 1023];
                        break;
                    case 6:
                        av = d[(av >> 10) & 31][av & 1023];
                        break;
                    case 7:
                        av = d[(av >> 10) & 31][av & 1023];
                        break
                }
                var ak = (R[av] | (R[(av + 1) & 255] << 8)) + this.Y;
                this.PC = E + 2;
                break;
            case 10:
                var av = E + 1;
                switch ((av & 57344) >> 13) {
                    case 0:
                        av = R[av & 2047];
                        break;
                    case 1:
                        av = this.__video__readReg(av);
                        break;
                    case 2:
                        if (av === 16405) {
                            av = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (av === 16406) {
                                av = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (av === 16407) {
                                    av = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + av.toString(16))
                                    } else {
                                        av = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        av = 0;
                        break;
                    case 4:
                        av = d[(av >> 10) & 31][av & 1023];
                        break;
                    case 5:
                        av = d[(av >> 10) & 31][av & 1023];
                        break;
                    case 6:
                        av = d[(av >> 10) & 31][av & 1023];
                        break;
                    case 7:
                        av = d[(av >> 10) & 31][av & 1023];
                        break
                }
                var ak = (av >= 128 ? (av - 256) : av) + E + 2;
                this.PC = E + 2;
                break;
            case 11:
                this.PC = E + 1;
                break;
            default:
                throw new cycloa.err.CoreException("Invalid opcode.")
        }
        switch ((j & 65520) >> 4) {
            case 0:
                var ac;
                switch ((ak & 57344) >> 13) {
                    case 0:
                        ac = R[ak & 2047];
                        break;
                    case 1:
                        ac = this.__video__readReg(ak);
                        break;
                    case 2:
                        if (ak === 16405) {
                            ac = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (ak === 16406) {
                                ac = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (ak === 16407) {
                                    ac = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ak.toString(16))
                                    } else {
                                        ac = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        ac = 0;
                        break;
                    case 4:
                        ac = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 5:
                        ac = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 6:
                        ac = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 7:
                        ac = d[(ak >> 10) & 31][ak & 1023];
                        break
                }
                this.P = (this.P & 125) | H[this.A = ac];
                break;
            case 1:
                var O;
                switch ((ak & 57344) >> 13) {
                    case 0:
                        O = R[ak & 2047];
                        break;
                    case 1:
                        O = this.__video__readReg(ak);
                        break;
                    case 2:
                        if (ak === 16405) {
                            O = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (ak === 16406) {
                                O = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (ak === 16407) {
                                    O = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ak.toString(16))
                                    } else {
                                        O = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        O = 0;
                        break;
                    case 4:
                        O = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 5:
                        O = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 6:
                        O = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 7:
                        O = d[(ak >> 10) & 31][ak & 1023];
                        break
                }
                this.P = (this.P & 125) | H[this.X = O];
                break;
            case 2:
                var N;
                switch ((ak & 57344) >> 13) {
                    case 0:
                        N = R[ak & 2047];
                        break;
                    case 1:
                        N = this.__video__readReg(ak);
                        break;
                    case 2:
                        if (ak === 16405) {
                            N = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (ak === 16406) {
                                N = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (ak === 16407) {
                                    N = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ak.toString(16))
                                    } else {
                                        N = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        N = 0;
                        break;
                    case 4:
                        N = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 5:
                        N = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 6:
                        N = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 7:
                        N = d[(ak >> 10) & 31][ak & 1023];
                        break
                }
                this.P = (this.P & 125) | H[this.Y = N];
                break;
            case 3:
                switch ((ak & 57344) >> 13) {
                    case 0:
                        R[ak & 8191] = this.A;
                        break;
                    case 1:
                        this.__video__writeReg(ak, this.A);
                        break;
                    case 2:
                        switch (ak & 31) {
                            case 0:
                                this.__rectangle0__decayCounter = this.__rectangle0__volumeOrDecayRate = this.A & 15;
                                this.__rectangle0__decayEnabled = (this.A & 16) == 0;
                                this.__rectangle0__loopEnabled = (this.A & 32) == 32;
                                switch (this.A >> 6) {
                                    case 0:
                                        this.__rectangle0__dutyRatio = 2;
                                        break;
                                    case 1:
                                        this.__rectangle0__dutyRatio = 4;
                                        break;
                                    case 2:
                                        this.__rectangle0__dutyRatio = 8;
                                        break;
                                    case 3:
                                        this.__rectangle0__dutyRatio = 12;
                                        break
                                }
                                break;
                            case 1:
                                this.__rectangle0__sweepShiftAmount = this.A & 7;
                                this.__rectangle0__sweepIncreased = (this.A & 8) === 0;
                                this.__rectangle0__sweepCounter = this.__rectangle0__sweepUpdateRatio = (this.A >> 4) & 3;
                                this.__rectangle0__sweepEnabled = (this.A & 128) === 128;
                                break;
                            case 2:
                                this.__rectangle0__frequency = (this.__rectangle0__frequency & 1792) | (this.A);
                                break;
                            case 3:
                                this.__rectangle0__frequency = (this.__rectangle0__frequency & 255) | ((this.A & 7) << 8);
                                this.__rectangle0__lengthCounter = this.__audio__LengthCounterConst[this.A >> 3];
                                this.__rectangle0__dutyCounter = 0;
                                this.__rectangle0__decayReloaded = true;
                                break;
                            case 4:
                                this.__rectangle1__decayCounter = this.__rectangle1__volumeOrDecayRate = this.A & 15;
                                this.__rectangle1__decayEnabled = (this.A & 16) == 0;
                                this.__rectangle1__loopEnabled = (this.A & 32) == 32;
                                switch (this.A >> 6) {
                                    case 0:
                                        this.__rectangle1__dutyRatio = 2;
                                        break;
                                    case 1:
                                        this.__rectangle1__dutyRatio = 4;
                                        break;
                                    case 2:
                                        this.__rectangle1__dutyRatio = 8;
                                        break;
                                    case 3:
                                        this.__rectangle1__dutyRatio = 12;
                                        break
                                }
                                break;
                            case 5:
                                this.__rectangle1__sweepShiftAmount = this.A & 7;
                                this.__rectangle1__sweepIncreased = (this.A & 8) === 0;
                                this.__rectangle1__sweepCounter = this.__rectangle1__sweepUpdateRatio = (this.A >> 4) & 3;
                                this.__rectangle1__sweepEnabled = (this.A & 128) === 128;
                                break;
                            case 6:
                                this.__rectangle1__frequency = (this.__rectangle1__frequency & 1792) | (this.A);
                                break;
                            case 7:
                                this.__rectangle1__frequency = (this.__rectangle1__frequency & 255) | ((this.A & 7) << 8);
                                this.__rectangle1__lengthCounter = this.__audio__LengthCounterConst[this.A >> 3];
                                this.__rectangle1__dutyCounter = 0;
                                this.__rectangle1__decayReloaded = true;
                                break;
                            case 8:
                                this.__triangle__enableLinearCounter = ((this.A & 128) == 128);
                                this.__triangle__linearCounterBuffer = this.A & 127;
                                break;
                            case 9:
                                break;
                            case 10:
                                this.__triangle__frequency = (this.__triangle__frequency & 1792) | this.A;
                                break;
                            case 11:
                                this.__triangle__frequency = (this.__triangle__frequency & 255) | ((this.A & 7) << 8);
                                this.__triangle__lengthCounter = this.__audio__LengthCounterConst[this.A >> 3];
                                this.__triangle__haltFlag = true;
                                break;
                            case 12:
                                this.__noize__decayCounter = this.__noize__volumeOrDecayRate = this.A & 15;
                                this.__noize__decayEnabled = (this.A & 16) == 0;
                                this.__noize__loopEnabled = (this.A & 32) == 32;
                                break;
                            case 13:
                                break;
                            case 14:
                                this.__noize__modeFlag = (this.A & 128) == 128;
                                this.__noize__frequency = this.__noize__FrequencyTable[this.A & 15];
                                break;
                            case 15:
                                this.__noize__lengthCounter = this.__audio__LengthCounterConst[this.A >> 3];
                                this.__noize__decayReloaded = true;
                                break;
                            case 16:
                                this.__digital__irqEnabled = (this.A & 128) == 128;
                                if (!this.__digital__irqEnabled) {
                                    this.IRQ &= 253
                                }
                                this.__digital__loopEnabled = (this.A & 64) == 64;
                                this.__digital__frequency = this.__digital__FrequencyTable[this.A & 15];
                                break;
                            case 17:
                                this.__digital__deltaCounter = this.A & 127;
                                break;
                            case 18:
                                this.__digital__sampleAddr = 49152 | (this.A << 6);
                                break;
                            case 19:
                                this.__digital__sampleLength = this.__digital__sampleLengthBuffer = (this.A << 4) | 1;
                                break;
                            case 20:
                                var l = this.A << 8;
                                var z = this.__video__spRam;
                                var ar = this.__video__spriteAddr;
                                for (var aj = 0; aj < 256; ++aj) {
                                    var ah = l | aj;
                                    var h;
                                    switch ((ah & 57344) >> 13) {
                                        case 0:
                                            h = R[ah & 2047];
                                            break;
                                        case 1:
                                            h = this.__video__readReg(ah);
                                            break;
                                        case 2:
                                            if (ah === 16405) {
                                                h = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                                                this.IRQ &= 254;
                                                this.IRQ &= 253
                                            } else {
                                                if (ah === 16406) {
                                                    h = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                                                } else {
                                                    if (ah === 16407) {
                                                        h = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                                    } else {
                                                        if (addr < 16408) {
                                                            throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ah.toString(16))
                                                        } else {
                                                            h = this.readMapperRegisterArea(addr)
                                                        }
                                                    }
                                                }
                                            }
                                            break;
                                        case 3:
                                            h = 0;
                                            break;
                                        case 4:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 5:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 6:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 7:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break
                                    }
                                    z[(ar + aj) & 255] = h
                                }
                                aa += 512;
                                break;
                            case 21:
                                if (!(this.A & 1)) {
                                    this.__rectangle0__lengthCounter = 0
                                }
                                if (!(this.A & 2)) {
                                    this.__rectangle1__lengthCounter = 0
                                }
                                if (!(this.A & 4)) {
                                    this.__triangle__lengthCounter = 0;
                                    this.__triangle__linearCounter = this.__triangle__linearCounterBuffer = 0
                                }
                                if (!(this.A & 8)) {
                                    this.__noize__lengthCounter = 0
                                }
                                if (!(this.A & 16)) {
                                    this.__digital__sampleLength = 0
                                } else {
                                    if (this.__digital__sampleLength == 0) {
                                        this.__digital__sampleLength = this.__digital__sampleLengthBuffer
                                    }
                                }
                                break;
                            case 22:
                                if ((this.A & 1) === 1) {
                                    this.__pad__pad1Idx = 0;
                                    this.__pad__pad2Idx = 0
                                }
                                break;
                            case 23:
                                if (this.A & 128) {
                                    this.__audio__isNTSCmode = false;
                                    this.__audio__frameCnt = 1786360;
                                    this.__audio__frameIRQCnt = 4
                                } else {
                                    this.__audio__isNTSCmode = true;
                                    this.__audio__frameIRQenabled = true;
                                    this.__audio__frameCnt = 1786360;
                                    this.__audio__frameIRQCnt = 3
                                } if ((this.A & 64) === 64) {
                                    this.__audio__frameIRQenabled = false;
                                    this.IRQ &= 254
                                }
                                break;
                            default:
                                break
                        }
                        break;
                    case 3:
                        break;
                    case 4:
                        this.writeMapperCPU(ak, this.A);
                        break;
                    case 5:
                        this.writeMapperCPU(ak, this.A);
                        break;
                    case 6:
                        this.writeMapperCPU(ak, this.A);
                        break;
                    case 7:
                        this.writeMapperCPU(ak, this.A);
                        break
                }
                break;
            case 4:
                switch ((ak & 57344) >> 13) {
                    case 0:
                        R[ak & 8191] = this.X;
                        break;
                    case 1:
                        this.__video__writeReg(ak, this.X);
                        break;
                    case 2:
                        switch (ak & 31) {
                            case 0:
                                this.__rectangle0__decayCounter = this.__rectangle0__volumeOrDecayRate = this.X & 15;
                                this.__rectangle0__decayEnabled = (this.X & 16) == 0;
                                this.__rectangle0__loopEnabled = (this.X & 32) == 32;
                                switch (this.X >> 6) {
                                    case 0:
                                        this.__rectangle0__dutyRatio = 2;
                                        break;
                                    case 1:
                                        this.__rectangle0__dutyRatio = 4;
                                        break;
                                    case 2:
                                        this.__rectangle0__dutyRatio = 8;
                                        break;
                                    case 3:
                                        this.__rectangle0__dutyRatio = 12;
                                        break
                                }
                                break;
                            case 1:
                                this.__rectangle0__sweepShiftAmount = this.X & 7;
                                this.__rectangle0__sweepIncreased = (this.X & 8) === 0;
                                this.__rectangle0__sweepCounter = this.__rectangle0__sweepUpdateRatio = (this.X >> 4) & 3;
                                this.__rectangle0__sweepEnabled = (this.X & 128) === 128;
                                break;
                            case 2:
                                this.__rectangle0__frequency = (this.__rectangle0__frequency & 1792) | (this.X);
                                break;
                            case 3:
                                this.__rectangle0__frequency = (this.__rectangle0__frequency & 255) | ((this.X & 7) << 8);
                                this.__rectangle0__lengthCounter = this.__audio__LengthCounterConst[this.X >> 3];
                                this.__rectangle0__dutyCounter = 0;
                                this.__rectangle0__decayReloaded = true;
                                break;
                            case 4:
                                this.__rectangle1__decayCounter = this.__rectangle1__volumeOrDecayRate = this.X & 15;
                                this.__rectangle1__decayEnabled = (this.X & 16) == 0;
                                this.__rectangle1__loopEnabled = (this.X & 32) == 32;
                                switch (this.X >> 6) {
                                    case 0:
                                        this.__rectangle1__dutyRatio = 2;
                                        break;
                                    case 1:
                                        this.__rectangle1__dutyRatio = 4;
                                        break;
                                    case 2:
                                        this.__rectangle1__dutyRatio = 8;
                                        break;
                                    case 3:
                                        this.__rectangle1__dutyRatio = 12;
                                        break
                                }
                                break;
                            case 5:
                                this.__rectangle1__sweepShiftAmount = this.X & 7;
                                this.__rectangle1__sweepIncreased = (this.X & 8) === 0;
                                this.__rectangle1__sweepCounter = this.__rectangle1__sweepUpdateRatio = (this.X >> 4) & 3;
                                this.__rectangle1__sweepEnabled = (this.X & 128) === 128;
                                break;
                            case 6:
                                this.__rectangle1__frequency = (this.__rectangle1__frequency & 1792) | (this.X);
                                break;
                            case 7:
                                this.__rectangle1__frequency = (this.__rectangle1__frequency & 255) | ((this.X & 7) << 8);
                                this.__rectangle1__lengthCounter = this.__audio__LengthCounterConst[this.X >> 3];
                                this.__rectangle1__dutyCounter = 0;
                                this.__rectangle1__decayReloaded = true;
                                break;
                            case 8:
                                this.__triangle__enableLinearCounter = ((this.X & 128) == 128);
                                this.__triangle__linearCounterBuffer = this.X & 127;
                                break;
                            case 9:
                                break;
                            case 10:
                                this.__triangle__frequency = (this.__triangle__frequency & 1792) | this.X;
                                break;
                            case 11:
                                this.__triangle__frequency = (this.__triangle__frequency & 255) | ((this.X & 7) << 8);
                                this.__triangle__lengthCounter = this.__audio__LengthCounterConst[this.X >> 3];
                                this.__triangle__haltFlag = true;
                                break;
                            case 12:
                                this.__noize__decayCounter = this.__noize__volumeOrDecayRate = this.X & 15;
                                this.__noize__decayEnabled = (this.X & 16) == 0;
                                this.__noize__loopEnabled = (this.X & 32) == 32;
                                break;
                            case 13:
                                break;
                            case 14:
                                this.__noize__modeFlag = (this.X & 128) == 128;
                                this.__noize__frequency = this.__noize__FrequencyTable[this.X & 15];
                                break;
                            case 15:
                                this.__noize__lengthCounter = this.__audio__LengthCounterConst[this.X >> 3];
                                this.__noize__decayReloaded = true;
                                break;
                            case 16:
                                this.__digital__irqEnabled = (this.X & 128) == 128;
                                if (!this.__digital__irqEnabled) {
                                    this.IRQ &= 253
                                }
                                this.__digital__loopEnabled = (this.X & 64) == 64;
                                this.__digital__frequency = this.__digital__FrequencyTable[this.X & 15];
                                break;
                            case 17:
                                this.__digital__deltaCounter = this.X & 127;
                                break;
                            case 18:
                                this.__digital__sampleAddr = 49152 | (this.X << 6);
                                break;
                            case 19:
                                this.__digital__sampleLength = this.__digital__sampleLengthBuffer = (this.X << 4) | 1;
                                break;
                            case 20:
                                var l = this.X << 8;
                                var z = this.__video__spRam;
                                var ar = this.__video__spriteAddr;
                                for (var aj = 0; aj < 256; ++aj) {
                                    var ah = l | aj;
                                    var h;
                                    switch ((ah & 57344) >> 13) {
                                        case 0:
                                            h = R[ah & 2047];
                                            break;
                                        case 1:
                                            h = this.__video__readReg(ah);
                                            break;
                                        case 2:
                                            if (ah === 16405) {
                                                h = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                                                this.IRQ &= 254;
                                                this.IRQ &= 253
                                            } else {
                                                if (ah === 16406) {
                                                    h = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                                                } else {
                                                    if (ah === 16407) {
                                                        h = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                                    } else {
                                                        if (addr < 16408) {
                                                            throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ah.toString(16))
                                                        } else {
                                                            h = this.readMapperRegisterArea(addr)
                                                        }
                                                    }
                                                }
                                            }
                                            break;
                                        case 3:
                                            h = 0;
                                            break;
                                        case 4:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 5:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 6:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 7:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break
                                    }
                                    z[(ar + aj) & 255] = h
                                }
                                aa += 512;
                                break;
                            case 21:
                                if (!(this.X & 1)) {
                                    this.__rectangle0__lengthCounter = 0
                                }
                                if (!(this.X & 2)) {
                                    this.__rectangle1__lengthCounter = 0
                                }
                                if (!(this.X & 4)) {
                                    this.__triangle__lengthCounter = 0;
                                    this.__triangle__linearCounter = this.__triangle__linearCounterBuffer = 0
                                }
                                if (!(this.X & 8)) {
                                    this.__noize__lengthCounter = 0
                                }
                                if (!(this.X & 16)) {
                                    this.__digital__sampleLength = 0
                                } else {
                                    if (this.__digital__sampleLength == 0) {
                                        this.__digital__sampleLength = this.__digital__sampleLengthBuffer
                                    }
                                }
                                break;
                            case 22:
                                if ((this.X & 1) === 1) {
                                    this.__pad__pad1Idx = 0;
                                    this.__pad__pad2Idx = 0
                                }
                                break;
                            case 23:
                                if (this.X & 128) {
                                    this.__audio__isNTSCmode = false;
                                    this.__audio__frameCnt = 1786360;
                                    this.__audio__frameIRQCnt = 4
                                } else {
                                    this.__audio__isNTSCmode = true;
                                    this.__audio__frameIRQenabled = true;
                                    this.__audio__frameCnt = 1786360;
                                    this.__audio__frameIRQCnt = 3
                                } if ((this.X & 64) === 64) {
                                    this.__audio__frameIRQenabled = false;
                                    this.IRQ &= 254
                                }
                                break;
                            default:
                                break
                        }
                        break;
                    case 3:
                        break;
                    case 4:
                        this.writeMapperCPU(ak, this.X);
                        break;
                    case 5:
                        this.writeMapperCPU(ak, this.X);
                        break;
                    case 6:
                        this.writeMapperCPU(ak, this.X);
                        break;
                    case 7:
                        this.writeMapperCPU(ak, this.X);
                        break
                }
                break;
            case 5:
                switch ((ak & 57344) >> 13) {
                    case 0:
                        R[ak & 8191] = this.Y;
                        break;
                    case 1:
                        this.__video__writeReg(ak, this.Y);
                        break;
                    case 2:
                        switch (ak & 31) {
                            case 0:
                                this.__rectangle0__decayCounter = this.__rectangle0__volumeOrDecayRate = this.Y & 15;
                                this.__rectangle0__decayEnabled = (this.Y & 16) == 0;
                                this.__rectangle0__loopEnabled = (this.Y & 32) == 32;
                                switch (this.Y >> 6) {
                                    case 0:
                                        this.__rectangle0__dutyRatio = 2;
                                        break;
                                    case 1:
                                        this.__rectangle0__dutyRatio = 4;
                                        break;
                                    case 2:
                                        this.__rectangle0__dutyRatio = 8;
                                        break;
                                    case 3:
                                        this.__rectangle0__dutyRatio = 12;
                                        break
                                }
                                break;
                            case 1:
                                this.__rectangle0__sweepShiftAmount = this.Y & 7;
                                this.__rectangle0__sweepIncreased = (this.Y & 8) === 0;
                                this.__rectangle0__sweepCounter = this.__rectangle0__sweepUpdateRatio = (this.Y >> 4) & 3;
                                this.__rectangle0__sweepEnabled = (this.Y & 128) === 128;
                                break;
                            case 2:
                                this.__rectangle0__frequency = (this.__rectangle0__frequency & 1792) | (this.Y);
                                break;
                            case 3:
                                this.__rectangle0__frequency = (this.__rectangle0__frequency & 255) | ((this.Y & 7) << 8);
                                this.__rectangle0__lengthCounter = this.__audio__LengthCounterConst[this.Y >> 3];
                                this.__rectangle0__dutyCounter = 0;
                                this.__rectangle0__decayReloaded = true;
                                break;
                            case 4:
                                this.__rectangle1__decayCounter = this.__rectangle1__volumeOrDecayRate = this.Y & 15;
                                this.__rectangle1__decayEnabled = (this.Y & 16) == 0;
                                this.__rectangle1__loopEnabled = (this.Y & 32) == 32;
                                switch (this.Y >> 6) {
                                    case 0:
                                        this.__rectangle1__dutyRatio = 2;
                                        break;
                                    case 1:
                                        this.__rectangle1__dutyRatio = 4;
                                        break;
                                    case 2:
                                        this.__rectangle1__dutyRatio = 8;
                                        break;
                                    case 3:
                                        this.__rectangle1__dutyRatio = 12;
                                        break
                                }
                                break;
                            case 5:
                                this.__rectangle1__sweepShiftAmount = this.Y & 7;
                                this.__rectangle1__sweepIncreased = (this.Y & 8) === 0;
                                this.__rectangle1__sweepCounter = this.__rectangle1__sweepUpdateRatio = (this.Y >> 4) & 3;
                                this.__rectangle1__sweepEnabled = (this.Y & 128) === 128;
                                break;
                            case 6:
                                this.__rectangle1__frequency = (this.__rectangle1__frequency & 1792) | (this.Y);
                                break;
                            case 7:
                                this.__rectangle1__frequency = (this.__rectangle1__frequency & 255) | ((this.Y & 7) << 8);
                                this.__rectangle1__lengthCounter = this.__audio__LengthCounterConst[this.Y >> 3];
                                this.__rectangle1__dutyCounter = 0;
                                this.__rectangle1__decayReloaded = true;
                                break;
                            case 8:
                                this.__triangle__enableLinearCounter = ((this.Y & 128) == 128);
                                this.__triangle__linearCounterBuffer = this.Y & 127;
                                break;
                            case 9:
                                break;
                            case 10:
                                this.__triangle__frequency = (this.__triangle__frequency & 1792) | this.Y;
                                break;
                            case 11:
                                this.__triangle__frequency = (this.__triangle__frequency & 255) | ((this.Y & 7) << 8);
                                this.__triangle__lengthCounter = this.__audio__LengthCounterConst[this.Y >> 3];
                                this.__triangle__haltFlag = true;
                                break;
                            case 12:
                                this.__noize__decayCounter = this.__noize__volumeOrDecayRate = this.Y & 15;
                                this.__noize__decayEnabled = (this.Y & 16) == 0;
                                this.__noize__loopEnabled = (this.Y & 32) == 32;
                                break;
                            case 13:
                                break;
                            case 14:
                                this.__noize__modeFlag = (this.Y & 128) == 128;
                                this.__noize__frequency = this.__noize__FrequencyTable[this.Y & 15];
                                break;
                            case 15:
                                this.__noize__lengthCounter = this.__audio__LengthCounterConst[this.Y >> 3];
                                this.__noize__decayReloaded = true;
                                break;
                            case 16:
                                this.__digital__irqEnabled = (this.Y & 128) == 128;
                                if (!this.__digital__irqEnabled) {
                                    this.IRQ &= 253
                                }
                                this.__digital__loopEnabled = (this.Y & 64) == 64;
                                this.__digital__frequency = this.__digital__FrequencyTable[this.Y & 15];
                                break;
                            case 17:
                                this.__digital__deltaCounter = this.Y & 127;
                                break;
                            case 18:
                                this.__digital__sampleAddr = 49152 | (this.Y << 6);
                                break;
                            case 19:
                                this.__digital__sampleLength = this.__digital__sampleLengthBuffer = (this.Y << 4) | 1;
                                break;
                            case 20:
                                var l = this.Y << 8;
                                var z = this.__video__spRam;
                                var ar = this.__video__spriteAddr;
                                for (var aj = 0; aj < 256; ++aj) {
                                    var ah = l | aj;
                                    var h;
                                    switch ((ah & 57344) >> 13) {
                                        case 0:
                                            h = R[ah & 2047];
                                            break;
                                        case 1:
                                            h = this.__video__readReg(ah);
                                            break;
                                        case 2:
                                            if (ah === 16405) {
                                                h = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                                                this.IRQ &= 254;
                                                this.IRQ &= 253
                                            } else {
                                                if (ah === 16406) {
                                                    h = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                                                } else {
                                                    if (ah === 16407) {
                                                        h = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                                    } else {
                                                        if (addr < 16408) {
                                                            throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ah.toString(16))
                                                        } else {
                                                            h = this.readMapperRegisterArea(addr)
                                                        }
                                                    }
                                                }
                                            }
                                            break;
                                        case 3:
                                            h = 0;
                                            break;
                                        case 4:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 5:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 6:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 7:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break
                                    }
                                    z[(ar + aj) & 255] = h
                                }
                                aa += 512;
                                break;
                            case 21:
                                if (!(this.Y & 1)) {
                                    this.__rectangle0__lengthCounter = 0
                                }
                                if (!(this.Y & 2)) {
                                    this.__rectangle1__lengthCounter = 0
                                }
                                if (!(this.Y & 4)) {
                                    this.__triangle__lengthCounter = 0;
                                    this.__triangle__linearCounter = this.__triangle__linearCounterBuffer = 0
                                }
                                if (!(this.Y & 8)) {
                                    this.__noize__lengthCounter = 0
                                }
                                if (!(this.Y & 16)) {
                                    this.__digital__sampleLength = 0
                                } else {
                                    if (this.__digital__sampleLength == 0) {
                                        this.__digital__sampleLength = this.__digital__sampleLengthBuffer
                                    }
                                }
                                break;
                            case 22:
                                if ((this.Y & 1) === 1) {
                                    this.__pad__pad1Idx = 0;
                                    this.__pad__pad2Idx = 0
                                }
                                break;
                            case 23:
                                if (this.Y & 128) {
                                    this.__audio__isNTSCmode = false;
                                    this.__audio__frameCnt = 1786360;
                                    this.__audio__frameIRQCnt = 4
                                } else {
                                    this.__audio__isNTSCmode = true;
                                    this.__audio__frameIRQenabled = true;
                                    this.__audio__frameCnt = 1786360;
                                    this.__audio__frameIRQCnt = 3
                                } if ((this.Y & 64) === 64) {
                                    this.__audio__frameIRQenabled = false;
                                    this.IRQ &= 254
                                }
                                break;
                            default:
                                break
                        }
                        break;
                    case 3:
                        break;
                    case 4:
                        this.writeMapperCPU(ak, this.Y);
                        break;
                    case 5:
                        this.writeMapperCPU(ak, this.Y);
                        break;
                    case 6:
                        this.writeMapperCPU(ak, this.Y);
                        break;
                    case 7:
                        this.writeMapperCPU(ak, this.Y);
                        break
                }
                break;
            case 6:
                this.P = (this.P & 125) | H[this.X = this.A];
                break;
            case 7:
                this.P = (this.P & 125) | H[this.Y = this.A];
                break;
            case 8:
                this.P = (this.P & 125) | H[this.X = this.SP];
                break;
            case 9:
                this.P = (this.P & 125) | H[this.A = this.X];
                break;
            case 10:
                this.SP = this.X;
                break;
            case 11:
                this.P = (this.P & 125) | H[this.A = this.Y];
                break;
            case 12:
                var w = this.P;
                var F = this.A;
                var S;
                switch ((ak & 57344) >> 13) {
                    case 0:
                        S = R[ak & 2047];
                        break;
                    case 1:
                        S = this.__video__readReg(ak);
                        break;
                    case 2:
                        if (ak === 16405) {
                            S = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (ak === 16406) {
                                S = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (ak === 16407) {
                                    S = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ak.toString(16))
                                    } else {
                                        S = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        S = 0;
                        break;
                    case 4:
                        S = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 5:
                        S = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 6:
                        S = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 7:
                        S = d[(ak >> 10) & 31][ak & 1023];
                        break
                }
                var v = (F + S + (w & 1)) & 65535;
                var C = v & 255;
                this.P = (w & 190) | ((((F ^ P) & 128) ^ 128) & ((F ^ C) & 128)) >> 1 | ((v >> 8) & 1);
                this.P = (this.P & 125) | H[this.A = C];
                break;
            case 13:
                var y;
                switch ((ak & 57344) >> 13) {
                    case 0:
                        y = R[ak & 2047];
                        break;
                    case 1:
                        y = this.__video__readReg(ak);
                        break;
                    case 2:
                        if (ak === 16405) {
                            y = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (ak === 16406) {
                                y = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (ak === 16407) {
                                    y = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ak.toString(16))
                                    } else {
                                        y = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        y = 0;
                        break;
                    case 4:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 5:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 6:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 7:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break
                }
                this.P = (this.P & 125) | H[this.A &= y];
                break;
            case 14:
                var P;
                switch ((ak & 57344) >> 13) {
                    case 0:
                        P = R[ak & 2047];
                        break;
                    case 1:
                        P = this.__video__readReg(ak);
                        break;
                    case 2:
                        if (ak === 16405) {
                            P = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (ak === 16406) {
                                P = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (ak === 16407) {
                                    P = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ak.toString(16))
                                    } else {
                                        P = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        P = 0;
                        break;
                    case 4:
                        P = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 5:
                        P = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 6:
                        P = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 7:
                        P = d[(ak >> 10) & 31][ak & 1023];
                        break
                }
                this.P = (this.P & 254) | P >> 7;
                var U = P << 1;
                switch ((ak & 57344) >> 13) {
                    case 0:
                        R[ak & 8191] = U;
                        break;
                    case 1:
                        this.__video__writeReg(ak, U);
                        break;
                    case 2:
                        switch (ak & 31) {
                            case 0:
                                this.__rectangle0__decayCounter = this.__rectangle0__volumeOrDecayRate = U & 15;
                                this.__rectangle0__decayEnabled = (U & 16) == 0;
                                this.__rectangle0__loopEnabled = (U & 32) == 32;
                                switch (U >> 6) {
                                    case 0:
                                        this.__rectangle0__dutyRatio = 2;
                                        break;
                                    case 1:
                                        this.__rectangle0__dutyRatio = 4;
                                        break;
                                    case 2:
                                        this.__rectangle0__dutyRatio = 8;
                                        break;
                                    case 3:
                                        this.__rectangle0__dutyRatio = 12;
                                        break
                                }
                                break;
                            case 1:
                                this.__rectangle0__sweepShiftAmount = U & 7;
                                this.__rectangle0__sweepIncreased = (U & 8) === 0;
                                this.__rectangle0__sweepCounter = this.__rectangle0__sweepUpdateRatio = (U >> 4) & 3;
                                this.__rectangle0__sweepEnabled = (U & 128) === 128;
                                break;
                            case 2:
                                this.__rectangle0__frequency = (this.__rectangle0__frequency & 1792) | (U);
                                break;
                            case 3:
                                this.__rectangle0__frequency = (this.__rectangle0__frequency & 255) | ((U & 7) << 8);
                                this.__rectangle0__lengthCounter = this.__audio__LengthCounterConst[U >> 3];
                                this.__rectangle0__dutyCounter = 0;
                                this.__rectangle0__decayReloaded = true;
                                break;
                            case 4:
                                this.__rectangle1__decayCounter = this.__rectangle1__volumeOrDecayRate = U & 15;
                                this.__rectangle1__decayEnabled = (U & 16) == 0;
                                this.__rectangle1__loopEnabled = (U & 32) == 32;
                                switch (U >> 6) {
                                    case 0:
                                        this.__rectangle1__dutyRatio = 2;
                                        break;
                                    case 1:
                                        this.__rectangle1__dutyRatio = 4;
                                        break;
                                    case 2:
                                        this.__rectangle1__dutyRatio = 8;
                                        break;
                                    case 3:
                                        this.__rectangle1__dutyRatio = 12;
                                        break
                                }
                                break;
                            case 5:
                                this.__rectangle1__sweepShiftAmount = U & 7;
                                this.__rectangle1__sweepIncreased = (U & 8) === 0;
                                this.__rectangle1__sweepCounter = this.__rectangle1__sweepUpdateRatio = (U >> 4) & 3;
                                this.__rectangle1__sweepEnabled = (U & 128) === 128;
                                break;
                            case 6:
                                this.__rectangle1__frequency = (this.__rectangle1__frequency & 1792) | (U);
                                break;
                            case 7:
                                this.__rectangle1__frequency = (this.__rectangle1__frequency & 255) | ((U & 7) << 8);
                                this.__rectangle1__lengthCounter = this.__audio__LengthCounterConst[U >> 3];
                                this.__rectangle1__dutyCounter = 0;
                                this.__rectangle1__decayReloaded = true;
                                break;
                            case 8:
                                this.__triangle__enableLinearCounter = ((U & 128) == 128);
                                this.__triangle__linearCounterBuffer = U & 127;
                                break;
                            case 9:
                                break;
                            case 10:
                                this.__triangle__frequency = (this.__triangle__frequency & 1792) | U;
                                break;
                            case 11:
                                this.__triangle__frequency = (this.__triangle__frequency & 255) | ((U & 7) << 8);
                                this.__triangle__lengthCounter = this.__audio__LengthCounterConst[U >> 3];
                                this.__triangle__haltFlag = true;
                                break;
                            case 12:
                                this.__noize__decayCounter = this.__noize__volumeOrDecayRate = U & 15;
                                this.__noize__decayEnabled = (U & 16) == 0;
                                this.__noize__loopEnabled = (U & 32) == 32;
                                break;
                            case 13:
                                break;
                            case 14:
                                this.__noize__modeFlag = (U & 128) == 128;
                                this.__noize__frequency = this.__noize__FrequencyTable[U & 15];
                                break;
                            case 15:
                                this.__noize__lengthCounter = this.__audio__LengthCounterConst[U >> 3];
                                this.__noize__decayReloaded = true;
                                break;
                            case 16:
                                this.__digital__irqEnabled = (U & 128) == 128;
                                if (!this.__digital__irqEnabled) {
                                    this.IRQ &= 253
                                }
                                this.__digital__loopEnabled = (U & 64) == 64;
                                this.__digital__frequency = this.__digital__FrequencyTable[U & 15];
                                break;
                            case 17:
                                this.__digital__deltaCounter = U & 127;
                                break;
                            case 18:
                                this.__digital__sampleAddr = 49152 | (U << 6);
                                break;
                            case 19:
                                this.__digital__sampleLength = this.__digital__sampleLengthBuffer = (U << 4) | 1;
                                break;
                            case 20:
                                var l = U << 8;
                                var z = this.__video__spRam;
                                var ar = this.__video__spriteAddr;
                                for (var aj = 0; aj < 256; ++aj) {
                                    var ah = l | aj;
                                    var h;
                                    switch ((ah & 57344) >> 13) {
                                        case 0:
                                            h = R[ah & 2047];
                                            break;
                                        case 1:
                                            h = this.__video__readReg(ah);
                                            break;
                                        case 2:
                                            if (ah === 16405) {
                                                h = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                                                this.IRQ &= 254;
                                                this.IRQ &= 253
                                            } else {
                                                if (ah === 16406) {
                                                    h = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                                                } else {
                                                    if (ah === 16407) {
                                                        h = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                                    } else {
                                                        if (addr < 16408) {
                                                            throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ah.toString(16))
                                                        } else {
                                                            h = this.readMapperRegisterArea(addr)
                                                        }
                                                    }
                                                }
                                            }
                                            break;
                                        case 3:
                                            h = 0;
                                            break;
                                        case 4:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 5:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 6:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 7:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break
                                    }
                                    z[(ar + aj) & 255] = h
                                }
                                aa += 512;
                                break;
                            case 21:
                                if (!(U & 1)) {
                                    this.__rectangle0__lengthCounter = 0
                                }
                                if (!(U & 2)) {
                                    this.__rectangle1__lengthCounter = 0
                                }
                                if (!(U & 4)) {
                                    this.__triangle__lengthCounter = 0;
                                    this.__triangle__linearCounter = this.__triangle__linearCounterBuffer = 0
                                }
                                if (!(U & 8)) {
                                    this.__noize__lengthCounter = 0
                                }
                                if (!(U & 16)) {
                                    this.__digital__sampleLength = 0
                                } else {
                                    if (this.__digital__sampleLength == 0) {
                                        this.__digital__sampleLength = this.__digital__sampleLengthBuffer
                                    }
                                }
                                break;
                            case 22:
                                if ((U & 1) === 1) {
                                    this.__pad__pad1Idx = 0;
                                    this.__pad__pad2Idx = 0
                                }
                                break;
                            case 23:
                                if (U & 128) {
                                    this.__audio__isNTSCmode = false;
                                    this.__audio__frameCnt = 1786360;
                                    this.__audio__frameIRQCnt = 4
                                } else {
                                    this.__audio__isNTSCmode = true;
                                    this.__audio__frameIRQenabled = true;
                                    this.__audio__frameCnt = 1786360;
                                    this.__audio__frameIRQCnt = 3
                                } if ((U & 64) === 64) {
                                    this.__audio__frameIRQenabled = false;
                                    this.IRQ &= 254
                                }
                                break;
                            default:
                                break
                        }
                        break;
                    case 3:
                        break;
                    case 4:
                        this.writeMapperCPU(ak, U);
                        break;
                    case 5:
                        this.writeMapperCPU(ak, U);
                        break;
                    case 6:
                        this.writeMapperCPU(ak, U);
                        break;
                    case 7:
                        this.writeMapperCPU(ak, U);
                        break
                }
                this.P = (this.P & 125) | H[U & 255];
                break;
            case 15:
                var au = this.A;
                this.P = (this.P & 254) | (au & 255) >> 7;
                this.P = (this.P & 125) | H[this.A = (au << 1) & 255];
                break;
            case 16:
                var P;
                switch ((ak & 57344) >> 13) {
                    case 0:
                        P = R[ak & 2047];
                        break;
                    case 1:
                        P = this.__video__readReg(ak);
                        break;
                    case 2:
                        if (ak === 16405) {
                            P = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (ak === 16406) {
                                P = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (ak === 16407) {
                                    P = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ak.toString(16))
                                    } else {
                                        P = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        P = 0;
                        break;
                    case 4:
                        P = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 5:
                        P = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 6:
                        P = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 7:
                        P = d[(ak >> 10) & 31][ak & 1023];
                        break
                }
                this.P = (this.P & 61) | (P & 192) | (H[this.A & P] & 2);
                break;
            case 17:
                var y;
                switch ((ak & 57344) >> 13) {
                    case 0:
                        y = R[ak & 2047];
                        break;
                    case 1:
                        y = this.__video__readReg(ak);
                        break;
                    case 2:
                        if (ak === 16405) {
                            y = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (ak === 16406) {
                                y = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (ak === 16407) {
                                    y = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ak.toString(16))
                                    } else {
                                        y = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        y = 0;
                        break;
                    case 4:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 5:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 6:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 7:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break
                }
                var P = (this.A - y) & 65535;
                this.P = (this.P & 125) | H[P & 255];
                this.P = (this.P & 254) | (((P >> 8) & 1) ^ 1);
                break;
            case 18:
                var y;
                switch ((ak & 57344) >> 13) {
                    case 0:
                        y = R[ak & 2047];
                        break;
                    case 1:
                        y = this.__video__readReg(ak);
                        break;
                    case 2:
                        if (ak === 16405) {
                            y = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (ak === 16406) {
                                y = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (ak === 16407) {
                                    y = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ak.toString(16))
                                    } else {
                                        y = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        y = 0;
                        break;
                    case 4:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 5:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 6:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 7:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break
                }
                var P = (this.X - y) & 65535;
                this.P = (this.P & 125) | H[P & 255];
                this.P = (this.P & 254) | (((P >> 8) & 1) ^ 1);
                break;
            case 19:
                var y;
                switch ((ak & 57344) >> 13) {
                    case 0:
                        y = R[ak & 2047];
                        break;
                    case 1:
                        y = this.__video__readReg(ak);
                        break;
                    case 2:
                        if (ak === 16405) {
                            y = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (ak === 16406) {
                                y = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (ak === 16407) {
                                    y = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ak.toString(16))
                                    } else {
                                        y = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        y = 0;
                        break;
                    case 4:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 5:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 6:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 7:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break
                }
                var P = (this.Y - y) & 65535;
                this.P = (this.P & 125) | H[P & 255];
                this.P = (this.P & 254) | (((P >> 8) & 1) ^ 1);
                break;
            case 20:
                var y;
                switch ((ak & 57344) >> 13) {
                    case 0:
                        y = R[ak & 2047];
                        break;
                    case 1:
                        y = this.__video__readReg(ak);
                        break;
                    case 2:
                        if (ak === 16405) {
                            y = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (ak === 16406) {
                                y = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (ak === 16407) {
                                    y = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ak.toString(16))
                                    } else {
                                        y = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        y = 0;
                        break;
                    case 4:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 5:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 6:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 7:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break
                }
                var P = (y - 1) & 255;
                this.P = (this.P & 125) | H[P];
                switch ((ak & 57344) >> 13) {
                    case 0:
                        R[ak & 8191] = P;
                        break;
                    case 1:
                        this.__video__writeReg(ak, P);
                        break;
                    case 2:
                        switch (ak & 31) {
                            case 0:
                                this.__rectangle0__decayCounter = this.__rectangle0__volumeOrDecayRate = P & 15;
                                this.__rectangle0__decayEnabled = (P & 16) == 0;
                                this.__rectangle0__loopEnabled = (P & 32) == 32;
                                switch (P >> 6) {
                                    case 0:
                                        this.__rectangle0__dutyRatio = 2;
                                        break;
                                    case 1:
                                        this.__rectangle0__dutyRatio = 4;
                                        break;
                                    case 2:
                                        this.__rectangle0__dutyRatio = 8;
                                        break;
                                    case 3:
                                        this.__rectangle0__dutyRatio = 12;
                                        break
                                }
                                break;
                            case 1:
                                this.__rectangle0__sweepShiftAmount = P & 7;
                                this.__rectangle0__sweepIncreased = (P & 8) === 0;
                                this.__rectangle0__sweepCounter = this.__rectangle0__sweepUpdateRatio = (P >> 4) & 3;
                                this.__rectangle0__sweepEnabled = (P & 128) === 128;
                                break;
                            case 2:
                                this.__rectangle0__frequency = (this.__rectangle0__frequency & 1792) | (P);
                                break;
                            case 3:
                                this.__rectangle0__frequency = (this.__rectangle0__frequency & 255) | ((P & 7) << 8);
                                this.__rectangle0__lengthCounter = this.__audio__LengthCounterConst[P >> 3];
                                this.__rectangle0__dutyCounter = 0;
                                this.__rectangle0__decayReloaded = true;
                                break;
                            case 4:
                                this.__rectangle1__decayCounter = this.__rectangle1__volumeOrDecayRate = P & 15;
                                this.__rectangle1__decayEnabled = (P & 16) == 0;
                                this.__rectangle1__loopEnabled = (P & 32) == 32;
                                switch (P >> 6) {
                                    case 0:
                                        this.__rectangle1__dutyRatio = 2;
                                        break;
                                    case 1:
                                        this.__rectangle1__dutyRatio = 4;
                                        break;
                                    case 2:
                                        this.__rectangle1__dutyRatio = 8;
                                        break;
                                    case 3:
                                        this.__rectangle1__dutyRatio = 12;
                                        break
                                }
                                break;
                            case 5:
                                this.__rectangle1__sweepShiftAmount = P & 7;
                                this.__rectangle1__sweepIncreased = (P & 8) === 0;
                                this.__rectangle1__sweepCounter = this.__rectangle1__sweepUpdateRatio = (P >> 4) & 3;
                                this.__rectangle1__sweepEnabled = (P & 128) === 128;
                                break;
                            case 6:
                                this.__rectangle1__frequency = (this.__rectangle1__frequency & 1792) | (P);
                                break;
                            case 7:
                                this.__rectangle1__frequency = (this.__rectangle1__frequency & 255) | ((P & 7) << 8);
                                this.__rectangle1__lengthCounter = this.__audio__LengthCounterConst[P >> 3];
                                this.__rectangle1__dutyCounter = 0;
                                this.__rectangle1__decayReloaded = true;
                                break;
                            case 8:
                                this.__triangle__enableLinearCounter = ((P & 128) == 128);
                                this.__triangle__linearCounterBuffer = P & 127;
                                break;
                            case 9:
                                break;
                            case 10:
                                this.__triangle__frequency = (this.__triangle__frequency & 1792) | P;
                                break;
                            case 11:
                                this.__triangle__frequency = (this.__triangle__frequency & 255) | ((P & 7) << 8);
                                this.__triangle__lengthCounter = this.__audio__LengthCounterConst[P >> 3];
                                this.__triangle__haltFlag = true;
                                break;
                            case 12:
                                this.__noize__decayCounter = this.__noize__volumeOrDecayRate = P & 15;
                                this.__noize__decayEnabled = (P & 16) == 0;
                                this.__noize__loopEnabled = (P & 32) == 32;
                                break;
                            case 13:
                                break;
                            case 14:
                                this.__noize__modeFlag = (P & 128) == 128;
                                this.__noize__frequency = this.__noize__FrequencyTable[P & 15];
                                break;
                            case 15:
                                this.__noize__lengthCounter = this.__audio__LengthCounterConst[P >> 3];
                                this.__noize__decayReloaded = true;
                                break;
                            case 16:
                                this.__digital__irqEnabled = (P & 128) == 128;
                                if (!this.__digital__irqEnabled) {
                                    this.IRQ &= 253
                                }
                                this.__digital__loopEnabled = (P & 64) == 64;
                                this.__digital__frequency = this.__digital__FrequencyTable[P & 15];
                                break;
                            case 17:
                                this.__digital__deltaCounter = P & 127;
                                break;
                            case 18:
                                this.__digital__sampleAddr = 49152 | (P << 6);
                                break;
                            case 19:
                                this.__digital__sampleLength = this.__digital__sampleLengthBuffer = (P << 4) | 1;
                                break;
                            case 20:
                                var l = P << 8;
                                var z = this.__video__spRam;
                                var ar = this.__video__spriteAddr;
                                for (var aj = 0; aj < 256; ++aj) {
                                    var ah = l | aj;
                                    var h;
                                    switch ((ah & 57344) >> 13) {
                                        case 0:
                                            h = R[ah & 2047];
                                            break;
                                        case 1:
                                            h = this.__video__readReg(ah);
                                            break;
                                        case 2:
                                            if (ah === 16405) {
                                                h = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                                                this.IRQ &= 254;
                                                this.IRQ &= 253
                                            } else {
                                                if (ah === 16406) {
                                                    h = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                                                } else {
                                                    if (ah === 16407) {
                                                        h = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                                    } else {
                                                        if (addr < 16408) {
                                                            throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ah.toString(16))
                                                        } else {
                                                            h = this.readMapperRegisterArea(addr)
                                                        }
                                                    }
                                                }
                                            }
                                            break;
                                        case 3:
                                            h = 0;
                                            break;
                                        case 4:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 5:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 6:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 7:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break
                                    }
                                    z[(ar + aj) & 255] = h
                                }
                                aa += 512;
                                break;
                            case 21:
                                if (!(P & 1)) {
                                    this.__rectangle0__lengthCounter = 0
                                }
                                if (!(P & 2)) {
                                    this.__rectangle1__lengthCounter = 0
                                }
                                if (!(P & 4)) {
                                    this.__triangle__lengthCounter = 0;
                                    this.__triangle__linearCounter = this.__triangle__linearCounterBuffer = 0
                                }
                                if (!(P & 8)) {
                                    this.__noize__lengthCounter = 0
                                }
                                if (!(P & 16)) {
                                    this.__digital__sampleLength = 0
                                } else {
                                    if (this.__digital__sampleLength == 0) {
                                        this.__digital__sampleLength = this.__digital__sampleLengthBuffer
                                    }
                                }
                                break;
                            case 22:
                                if ((P & 1) === 1) {
                                    this.__pad__pad1Idx = 0;
                                    this.__pad__pad2Idx = 0
                                }
                                break;
                            case 23:
                                if (P & 128) {
                                    this.__audio__isNTSCmode = false;
                                    this.__audio__frameCnt = 1786360;
                                    this.__audio__frameIRQCnt = 4
                                } else {
                                    this.__audio__isNTSCmode = true;
                                    this.__audio__frameIRQenabled = true;
                                    this.__audio__frameCnt = 1786360;
                                    this.__audio__frameIRQCnt = 3
                                } if ((P & 64) === 64) {
                                    this.__audio__frameIRQenabled = false;
                                    this.IRQ &= 254
                                }
                                break;
                            default:
                                break
                        }
                        break;
                    case 3:
                        break;
                    case 4:
                        this.writeMapperCPU(ak, P);
                        break;
                    case 5:
                        this.writeMapperCPU(ak, P);
                        break;
                    case 6:
                        this.writeMapperCPU(ak, P);
                        break;
                    case 7:
                        this.writeMapperCPU(ak, P);
                        break
                }
                break;
            case 21:
                this.P = (this.P & 125) | H[this.X = (this.X - 1) & 255];
                break;
            case 22:
                this.P = (this.P & 125) | H[this.Y = (this.Y - 1) & 255];
                break;
            case 23:
                var y;
                switch ((ak & 57344) >> 13) {
                    case 0:
                        y = R[ak & 2047];
                        break;
                    case 1:
                        y = this.__video__readReg(ak);
                        break;
                    case 2:
                        if (ak === 16405) {
                            y = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (ak === 16406) {
                                y = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (ak === 16407) {
                                    y = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ak.toString(16))
                                    } else {
                                        y = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        y = 0;
                        break;
                    case 4:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 5:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 6:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 7:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break
                }
                this.P = (this.P & 125) | H[this.A ^= y];
                break;
            case 24:
                var y;
                switch ((ak & 57344) >> 13) {
                    case 0:
                        y = R[ak & 2047];
                        break;
                    case 1:
                        y = this.__video__readReg(ak);
                        break;
                    case 2:
                        if (ak === 16405) {
                            y = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (ak === 16406) {
                                y = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (ak === 16407) {
                                    y = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ak.toString(16))
                                    } else {
                                        y = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        y = 0;
                        break;
                    case 4:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 5:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 6:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 7:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break
                }
                var P = (y + 1) & 255;
                this.P = (this.P & 125) | H[P];
                switch ((ak & 57344) >> 13) {
                    case 0:
                        R[ak & 8191] = P;
                        break;
                    case 1:
                        this.__video__writeReg(ak, P);
                        break;
                    case 2:
                        switch (ak & 31) {
                            case 0:
                                this.__rectangle0__decayCounter = this.__rectangle0__volumeOrDecayRate = P & 15;
                                this.__rectangle0__decayEnabled = (P & 16) == 0;
                                this.__rectangle0__loopEnabled = (P & 32) == 32;
                                switch (P >> 6) {
                                    case 0:
                                        this.__rectangle0__dutyRatio = 2;
                                        break;
                                    case 1:
                                        this.__rectangle0__dutyRatio = 4;
                                        break;
                                    case 2:
                                        this.__rectangle0__dutyRatio = 8;
                                        break;
                                    case 3:
                                        this.__rectangle0__dutyRatio = 12;
                                        break
                                }
                                break;
                            case 1:
                                this.__rectangle0__sweepShiftAmount = P & 7;
                                this.__rectangle0__sweepIncreased = (P & 8) === 0;
                                this.__rectangle0__sweepCounter = this.__rectangle0__sweepUpdateRatio = (P >> 4) & 3;
                                this.__rectangle0__sweepEnabled = (P & 128) === 128;
                                break;
                            case 2:
                                this.__rectangle0__frequency = (this.__rectangle0__frequency & 1792) | (P);
                                break;
                            case 3:
                                this.__rectangle0__frequency = (this.__rectangle0__frequency & 255) | ((P & 7) << 8);
                                this.__rectangle0__lengthCounter = this.__audio__LengthCounterConst[P >> 3];
                                this.__rectangle0__dutyCounter = 0;
                                this.__rectangle0__decayReloaded = true;
                                break;
                            case 4:
                                this.__rectangle1__decayCounter = this.__rectangle1__volumeOrDecayRate = P & 15;
                                this.__rectangle1__decayEnabled = (P & 16) == 0;
                                this.__rectangle1__loopEnabled = (P & 32) == 32;
                                switch (P >> 6) {
                                    case 0:
                                        this.__rectangle1__dutyRatio = 2;
                                        break;
                                    case 1:
                                        this.__rectangle1__dutyRatio = 4;
                                        break;
                                    case 2:
                                        this.__rectangle1__dutyRatio = 8;
                                        break;
                                    case 3:
                                        this.__rectangle1__dutyRatio = 12;
                                        break
                                }
                                break;
                            case 5:
                                this.__rectangle1__sweepShiftAmount = P & 7;
                                this.__rectangle1__sweepIncreased = (P & 8) === 0;
                                this.__rectangle1__sweepCounter = this.__rectangle1__sweepUpdateRatio = (P >> 4) & 3;
                                this.__rectangle1__sweepEnabled = (P & 128) === 128;
                                break;
                            case 6:
                                this.__rectangle1__frequency = (this.__rectangle1__frequency & 1792) | (P);
                                break;
                            case 7:
                                this.__rectangle1__frequency = (this.__rectangle1__frequency & 255) | ((P & 7) << 8);
                                this.__rectangle1__lengthCounter = this.__audio__LengthCounterConst[P >> 3];
                                this.__rectangle1__dutyCounter = 0;
                                this.__rectangle1__decayReloaded = true;
                                break;
                            case 8:
                                this.__triangle__enableLinearCounter = ((P & 128) == 128);
                                this.__triangle__linearCounterBuffer = P & 127;
                                break;
                            case 9:
                                break;
                            case 10:
                                this.__triangle__frequency = (this.__triangle__frequency & 1792) | P;
                                break;
                            case 11:
                                this.__triangle__frequency = (this.__triangle__frequency & 255) | ((P & 7) << 8);
                                this.__triangle__lengthCounter = this.__audio__LengthCounterConst[P >> 3];
                                this.__triangle__haltFlag = true;
                                break;
                            case 12:
                                this.__noize__decayCounter = this.__noize__volumeOrDecayRate = P & 15;
                                this.__noize__decayEnabled = (P & 16) == 0;
                                this.__noize__loopEnabled = (P & 32) == 32;
                                break;
                            case 13:
                                break;
                            case 14:
                                this.__noize__modeFlag = (P & 128) == 128;
                                this.__noize__frequency = this.__noize__FrequencyTable[P & 15];
                                break;
                            case 15:
                                this.__noize__lengthCounter = this.__audio__LengthCounterConst[P >> 3];
                                this.__noize__decayReloaded = true;
                                break;
                            case 16:
                                this.__digital__irqEnabled = (P & 128) == 128;
                                if (!this.__digital__irqEnabled) {
                                    this.IRQ &= 253
                                }
                                this.__digital__loopEnabled = (P & 64) == 64;
                                this.__digital__frequency = this.__digital__FrequencyTable[P & 15];
                                break;
                            case 17:
                                this.__digital__deltaCounter = P & 127;
                                break;
                            case 18:
                                this.__digital__sampleAddr = 49152 | (P << 6);
                                break;
                            case 19:
                                this.__digital__sampleLength = this.__digital__sampleLengthBuffer = (P << 4) | 1;
                                break;
                            case 20:
                                var l = P << 8;
                                var z = this.__video__spRam;
                                var ar = this.__video__spriteAddr;
                                for (var aj = 0; aj < 256; ++aj) {
                                    var ah = l | aj;
                                    var h;
                                    switch ((ah & 57344) >> 13) {
                                        case 0:
                                            h = R[ah & 2047];
                                            break;
                                        case 1:
                                            h = this.__video__readReg(ah);
                                            break;
                                        case 2:
                                            if (ah === 16405) {
                                                h = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                                                this.IRQ &= 254;
                                                this.IRQ &= 253
                                            } else {
                                                if (ah === 16406) {
                                                    h = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                                                } else {
                                                    if (ah === 16407) {
                                                        h = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                                    } else {
                                                        if (addr < 16408) {
                                                            throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ah.toString(16))
                                                        } else {
                                                            h = this.readMapperRegisterArea(addr)
                                                        }
                                                    }
                                                }
                                            }
                                            break;
                                        case 3:
                                            h = 0;
                                            break;
                                        case 4:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 5:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 6:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 7:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break
                                    }
                                    z[(ar + aj) & 255] = h
                                }
                                aa += 512;
                                break;
                            case 21:
                                if (!(P & 1)) {
                                    this.__rectangle0__lengthCounter = 0
                                }
                                if (!(P & 2)) {
                                    this.__rectangle1__lengthCounter = 0
                                }
                                if (!(P & 4)) {
                                    this.__triangle__lengthCounter = 0;
                                    this.__triangle__linearCounter = this.__triangle__linearCounterBuffer = 0
                                }
                                if (!(P & 8)) {
                                    this.__noize__lengthCounter = 0
                                }
                                if (!(P & 16)) {
                                    this.__digital__sampleLength = 0
                                } else {
                                    if (this.__digital__sampleLength == 0) {
                                        this.__digital__sampleLength = this.__digital__sampleLengthBuffer
                                    }
                                }
                                break;
                            case 22:
                                if ((P & 1) === 1) {
                                    this.__pad__pad1Idx = 0;
                                    this.__pad__pad2Idx = 0
                                }
                                break;
                            case 23:
                                if (P & 128) {
                                    this.__audio__isNTSCmode = false;
                                    this.__audio__frameCnt = 1786360;
                                    this.__audio__frameIRQCnt = 4
                                } else {
                                    this.__audio__isNTSCmode = true;
                                    this.__audio__frameIRQenabled = true;
                                    this.__audio__frameCnt = 1786360;
                                    this.__audio__frameIRQCnt = 3
                                } if ((P & 64) === 64) {
                                    this.__audio__frameIRQenabled = false;
                                    this.IRQ &= 254
                                }
                                break;
                            default:
                                break
                        }
                        break;
                    case 3:
                        break;
                    case 4:
                        this.writeMapperCPU(ak, P);
                        break;
                    case 5:
                        this.writeMapperCPU(ak, P);
                        break;
                    case 6:
                        this.writeMapperCPU(ak, P);
                        break;
                    case 7:
                        this.writeMapperCPU(ak, P);
                        break
                }
                break;
            case 25:
                this.P = (this.P & 125) | H[this.X = (this.X + 1) & 255];
                break;
            case 26:
                this.P = (this.P & 125) | H[this.Y = (this.Y + 1) & 255];
                break;
            case 27:
                var P;
                switch ((ak & 57344) >> 13) {
                    case 0:
                        P = R[ak & 2047];
                        break;
                    case 1:
                        P = this.__video__readReg(ak);
                        break;
                    case 2:
                        if (ak === 16405) {
                            P = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (ak === 16406) {
                                P = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (ak === 16407) {
                                    P = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ak.toString(16))
                                    } else {
                                        P = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        P = 0;
                        break;
                    case 4:
                        P = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 5:
                        P = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 6:
                        P = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 7:
                        P = d[(ak >> 10) & 31][ak & 1023];
                        break
                }
                this.P = (this.P & 254) | (P & 1);
                var U = P >> 1;
                switch ((ak & 57344) >> 13) {
                    case 0:
                        R[ak & 8191] = U;
                        break;
                    case 1:
                        this.__video__writeReg(ak, U);
                        break;
                    case 2:
                        switch (ak & 31) {
                            case 0:
                                this.__rectangle0__decayCounter = this.__rectangle0__volumeOrDecayRate = U & 15;
                                this.__rectangle0__decayEnabled = (U & 16) == 0;
                                this.__rectangle0__loopEnabled = (U & 32) == 32;
                                switch (U >> 6) {
                                    case 0:
                                        this.__rectangle0__dutyRatio = 2;
                                        break;
                                    case 1:
                                        this.__rectangle0__dutyRatio = 4;
                                        break;
                                    case 2:
                                        this.__rectangle0__dutyRatio = 8;
                                        break;
                                    case 3:
                                        this.__rectangle0__dutyRatio = 12;
                                        break
                                }
                                break;
                            case 1:
                                this.__rectangle0__sweepShiftAmount = U & 7;
                                this.__rectangle0__sweepIncreased = (U & 8) === 0;
                                this.__rectangle0__sweepCounter = this.__rectangle0__sweepUpdateRatio = (U >> 4) & 3;
                                this.__rectangle0__sweepEnabled = (U & 128) === 128;
                                break;
                            case 2:
                                this.__rectangle0__frequency = (this.__rectangle0__frequency & 1792) | (U);
                                break;
                            case 3:
                                this.__rectangle0__frequency = (this.__rectangle0__frequency & 255) | ((U & 7) << 8);
                                this.__rectangle0__lengthCounter = this.__audio__LengthCounterConst[U >> 3];
                                this.__rectangle0__dutyCounter = 0;
                                this.__rectangle0__decayReloaded = true;
                                break;
                            case 4:
                                this.__rectangle1__decayCounter = this.__rectangle1__volumeOrDecayRate = U & 15;
                                this.__rectangle1__decayEnabled = (U & 16) == 0;
                                this.__rectangle1__loopEnabled = (U & 32) == 32;
                                switch (U >> 6) {
                                    case 0:
                                        this.__rectangle1__dutyRatio = 2;
                                        break;
                                    case 1:
                                        this.__rectangle1__dutyRatio = 4;
                                        break;
                                    case 2:
                                        this.__rectangle1__dutyRatio = 8;
                                        break;
                                    case 3:
                                        this.__rectangle1__dutyRatio = 12;
                                        break
                                }
                                break;
                            case 5:
                                this.__rectangle1__sweepShiftAmount = U & 7;
                                this.__rectangle1__sweepIncreased = (U & 8) === 0;
                                this.__rectangle1__sweepCounter = this.__rectangle1__sweepUpdateRatio = (U >> 4) & 3;
                                this.__rectangle1__sweepEnabled = (U & 128) === 128;
                                break;
                            case 6:
                                this.__rectangle1__frequency = (this.__rectangle1__frequency & 1792) | (U);
                                break;
                            case 7:
                                this.__rectangle1__frequency = (this.__rectangle1__frequency & 255) | ((U & 7) << 8);
                                this.__rectangle1__lengthCounter = this.__audio__LengthCounterConst[U >> 3];
                                this.__rectangle1__dutyCounter = 0;
                                this.__rectangle1__decayReloaded = true;
                                break;
                            case 8:
                                this.__triangle__enableLinearCounter = ((U & 128) == 128);
                                this.__triangle__linearCounterBuffer = U & 127;
                                break;
                            case 9:
                                break;
                            case 10:
                                this.__triangle__frequency = (this.__triangle__frequency & 1792) | U;
                                break;
                            case 11:
                                this.__triangle__frequency = (this.__triangle__frequency & 255) | ((U & 7) << 8);
                                this.__triangle__lengthCounter = this.__audio__LengthCounterConst[U >> 3];
                                this.__triangle__haltFlag = true;
                                break;
                            case 12:
                                this.__noize__decayCounter = this.__noize__volumeOrDecayRate = U & 15;
                                this.__noize__decayEnabled = (U & 16) == 0;
                                this.__noize__loopEnabled = (U & 32) == 32;
                                break;
                            case 13:
                                break;
                            case 14:
                                this.__noize__modeFlag = (U & 128) == 128;
                                this.__noize__frequency = this.__noize__FrequencyTable[U & 15];
                                break;
                            case 15:
                                this.__noize__lengthCounter = this.__audio__LengthCounterConst[U >> 3];
                                this.__noize__decayReloaded = true;
                                break;
                            case 16:
                                this.__digital__irqEnabled = (U & 128) == 128;
                                if (!this.__digital__irqEnabled) {
                                    this.IRQ &= 253
                                }
                                this.__digital__loopEnabled = (U & 64) == 64;
                                this.__digital__frequency = this.__digital__FrequencyTable[U & 15];
                                break;
                            case 17:
                                this.__digital__deltaCounter = U & 127;
                                break;
                            case 18:
                                this.__digital__sampleAddr = 49152 | (U << 6);
                                break;
                            case 19:
                                this.__digital__sampleLength = this.__digital__sampleLengthBuffer = (U << 4) | 1;
                                break;
                            case 20:
                                var l = U << 8;
                                var z = this.__video__spRam;
                                var ar = this.__video__spriteAddr;
                                for (var aj = 0; aj < 256; ++aj) {
                                    var ah = l | aj;
                                    var h;
                                    switch ((ah & 57344) >> 13) {
                                        case 0:
                                            h = R[ah & 2047];
                                            break;
                                        case 1:
                                            h = this.__video__readReg(ah);
                                            break;
                                        case 2:
                                            if (ah === 16405) {
                                                h = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                                                this.IRQ &= 254;
                                                this.IRQ &= 253
                                            } else {
                                                if (ah === 16406) {
                                                    h = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                                                } else {
                                                    if (ah === 16407) {
                                                        h = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                                    } else {
                                                        if (addr < 16408) {
                                                            throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ah.toString(16))
                                                        } else {
                                                            h = this.readMapperRegisterArea(addr)
                                                        }
                                                    }
                                                }
                                            }
                                            break;
                                        case 3:
                                            h = 0;
                                            break;
                                        case 4:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 5:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 6:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 7:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break
                                    }
                                    z[(ar + aj) & 255] = h
                                }
                                aa += 512;
                                break;
                            case 21:
                                if (!(U & 1)) {
                                    this.__rectangle0__lengthCounter = 0
                                }
                                if (!(U & 2)) {
                                    this.__rectangle1__lengthCounter = 0
                                }
                                if (!(U & 4)) {
                                    this.__triangle__lengthCounter = 0;
                                    this.__triangle__linearCounter = this.__triangle__linearCounterBuffer = 0
                                }
                                if (!(U & 8)) {
                                    this.__noize__lengthCounter = 0
                                }
                                if (!(U & 16)) {
                                    this.__digital__sampleLength = 0
                                } else {
                                    if (this.__digital__sampleLength == 0) {
                                        this.__digital__sampleLength = this.__digital__sampleLengthBuffer
                                    }
                                }
                                break;
                            case 22:
                                if ((U & 1) === 1) {
                                    this.__pad__pad1Idx = 0;
                                    this.__pad__pad2Idx = 0
                                }
                                break;
                            case 23:
                                if (U & 128) {
                                    this.__audio__isNTSCmode = false;
                                    this.__audio__frameCnt = 1786360;
                                    this.__audio__frameIRQCnt = 4
                                } else {
                                    this.__audio__isNTSCmode = true;
                                    this.__audio__frameIRQenabled = true;
                                    this.__audio__frameCnt = 1786360;
                                    this.__audio__frameIRQCnt = 3
                                } if ((U & 64) === 64) {
                                    this.__audio__frameIRQenabled = false;
                                    this.IRQ &= 254
                                }
                                break;
                            default:
                                break
                        }
                        break;
                    case 3:
                        break;
                    case 4:
                        this.writeMapperCPU(ak, U);
                        break;
                    case 5:
                        this.writeMapperCPU(ak, U);
                        break;
                    case 6:
                        this.writeMapperCPU(ak, U);
                        break;
                    case 7:
                        this.writeMapperCPU(ak, U);
                        break
                }
                this.P = (this.P & 125) | H[U];
                break;
            case 28:
                this.P = (this.P & 254) | (this.A & 1);
                this.P = (this.P & 125) | H[this.A >>= 1];
                break;
            case 29:
                var y;
                switch ((ak & 57344) >> 13) {
                    case 0:
                        y = R[ak & 2047];
                        break;
                    case 1:
                        y = this.__video__readReg(ak);
                        break;
                    case 2:
                        if (ak === 16405) {
                            y = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (ak === 16406) {
                                y = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (ak === 16407) {
                                    y = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ak.toString(16))
                                    } else {
                                        y = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        y = 0;
                        break;
                    case 4:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 5:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 6:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 7:
                        y = d[(ak >> 10) & 31][ak & 1023];
                        break
                }
                this.P = (this.P & 125) | H[this.A |= y];
                break;
            case 30:
                var P;
                switch ((ak & 57344) >> 13) {
                    case 0:
                        P = R[ak & 2047];
                        break;
                    case 1:
                        P = this.__video__readReg(ak);
                        break;
                    case 2:
                        if (ak === 16405) {
                            P = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (ak === 16406) {
                                P = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (ak === 16407) {
                                    P = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ak.toString(16))
                                    } else {
                                        P = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        P = 0;
                        break;
                    case 4:
                        P = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 5:
                        P = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 6:
                        P = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 7:
                        P = d[(ak >> 10) & 31][ak & 1023];
                        break
                }
                var ae = this.P;
                var U = ((P << 1) & 255) | (ae & 1);
                this.P = (ae & 254) | (P >> 7);
                this.P = (this.P & 125) | H[U];
                switch ((ak & 57344) >> 13) {
                    case 0:
                        R[ak & 8191] = U;
                        break;
                    case 1:
                        this.__video__writeReg(ak, U);
                        break;
                    case 2:
                        switch (ak & 31) {
                            case 0:
                                this.__rectangle0__decayCounter = this.__rectangle0__volumeOrDecayRate = U & 15;
                                this.__rectangle0__decayEnabled = (U & 16) == 0;
                                this.__rectangle0__loopEnabled = (U & 32) == 32;
                                switch (U >> 6) {
                                    case 0:
                                        this.__rectangle0__dutyRatio = 2;
                                        break;
                                    case 1:
                                        this.__rectangle0__dutyRatio = 4;
                                        break;
                                    case 2:
                                        this.__rectangle0__dutyRatio = 8;
                                        break;
                                    case 3:
                                        this.__rectangle0__dutyRatio = 12;
                                        break
                                }
                                break;
                            case 1:
                                this.__rectangle0__sweepShiftAmount = U & 7;
                                this.__rectangle0__sweepIncreased = (U & 8) === 0;
                                this.__rectangle0__sweepCounter = this.__rectangle0__sweepUpdateRatio = (U >> 4) & 3;
                                this.__rectangle0__sweepEnabled = (U & 128) === 128;
                                break;
                            case 2:
                                this.__rectangle0__frequency = (this.__rectangle0__frequency & 1792) | (U);
                                break;
                            case 3:
                                this.__rectangle0__frequency = (this.__rectangle0__frequency & 255) | ((U & 7) << 8);
                                this.__rectangle0__lengthCounter = this.__audio__LengthCounterConst[U >> 3];
                                this.__rectangle0__dutyCounter = 0;
                                this.__rectangle0__decayReloaded = true;
                                break;
                            case 4:
                                this.__rectangle1__decayCounter = this.__rectangle1__volumeOrDecayRate = U & 15;
                                this.__rectangle1__decayEnabled = (U & 16) == 0;
                                this.__rectangle1__loopEnabled = (U & 32) == 32;
                                switch (U >> 6) {
                                    case 0:
                                        this.__rectangle1__dutyRatio = 2;
                                        break;
                                    case 1:
                                        this.__rectangle1__dutyRatio = 4;
                                        break;
                                    case 2:
                                        this.__rectangle1__dutyRatio = 8;
                                        break;
                                    case 3:
                                        this.__rectangle1__dutyRatio = 12;
                                        break
                                }
                                break;
                            case 5:
                                this.__rectangle1__sweepShiftAmount = U & 7;
                                this.__rectangle1__sweepIncreased = (U & 8) === 0;
                                this.__rectangle1__sweepCounter = this.__rectangle1__sweepUpdateRatio = (U >> 4) & 3;
                                this.__rectangle1__sweepEnabled = (U & 128) === 128;
                                break;
                            case 6:
                                this.__rectangle1__frequency = (this.__rectangle1__frequency & 1792) | (U);
                                break;
                            case 7:
                                this.__rectangle1__frequency = (this.__rectangle1__frequency & 255) | ((U & 7) << 8);
                                this.__rectangle1__lengthCounter = this.__audio__LengthCounterConst[U >> 3];
                                this.__rectangle1__dutyCounter = 0;
                                this.__rectangle1__decayReloaded = true;
                                break;
                            case 8:
                                this.__triangle__enableLinearCounter = ((U & 128) == 128);
                                this.__triangle__linearCounterBuffer = U & 127;
                                break;
                            case 9:
                                break;
                            case 10:
                                this.__triangle__frequency = (this.__triangle__frequency & 1792) | U;
                                break;
                            case 11:
                                this.__triangle__frequency = (this.__triangle__frequency & 255) | ((U & 7) << 8);
                                this.__triangle__lengthCounter = this.__audio__LengthCounterConst[U >> 3];
                                this.__triangle__haltFlag = true;
                                break;
                            case 12:
                                this.__noize__decayCounter = this.__noize__volumeOrDecayRate = U & 15;
                                this.__noize__decayEnabled = (U & 16) == 0;
                                this.__noize__loopEnabled = (U & 32) == 32;
                                break;
                            case 13:
                                break;
                            case 14:
                                this.__noize__modeFlag = (U & 128) == 128;
                                this.__noize__frequency = this.__noize__FrequencyTable[U & 15];
                                break;
                            case 15:
                                this.__noize__lengthCounter = this.__audio__LengthCounterConst[U >> 3];
                                this.__noize__decayReloaded = true;
                                break;
                            case 16:
                                this.__digital__irqEnabled = (U & 128) == 128;
                                if (!this.__digital__irqEnabled) {
                                    this.IRQ &= 253
                                }
                                this.__digital__loopEnabled = (U & 64) == 64;
                                this.__digital__frequency = this.__digital__FrequencyTable[U & 15];
                                break;
                            case 17:
                                this.__digital__deltaCounter = U & 127;
                                break;
                            case 18:
                                this.__digital__sampleAddr = 49152 | (U << 6);
                                break;
                            case 19:
                                this.__digital__sampleLength = this.__digital__sampleLengthBuffer = (U << 4) | 1;
                                break;
                            case 20:
                                var l = U << 8;
                                var z = this.__video__spRam;
                                var ar = this.__video__spriteAddr;
                                for (var aj = 0; aj < 256; ++aj) {
                                    var ah = l | aj;
                                    var h;
                                    switch ((ah & 57344) >> 13) {
                                        case 0:
                                            h = R[ah & 2047];
                                            break;
                                        case 1:
                                            h = this.__video__readReg(ah);
                                            break;
                                        case 2:
                                            if (ah === 16405) {
                                                h = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                                                this.IRQ &= 254;
                                                this.IRQ &= 253
                                            } else {
                                                if (ah === 16406) {
                                                    h = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                                                } else {
                                                    if (ah === 16407) {
                                                        h = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                                    } else {
                                                        if (addr < 16408) {
                                                            throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ah.toString(16))
                                                        } else {
                                                            h = this.readMapperRegisterArea(addr)
                                                        }
                                                    }
                                                }
                                            }
                                            break;
                                        case 3:
                                            h = 0;
                                            break;
                                        case 4:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 5:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 6:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 7:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break
                                    }
                                    z[(ar + aj) & 255] = h
                                }
                                aa += 512;
                                break;
                            case 21:
                                if (!(U & 1)) {
                                    this.__rectangle0__lengthCounter = 0
                                }
                                if (!(U & 2)) {
                                    this.__rectangle1__lengthCounter = 0
                                }
                                if (!(U & 4)) {
                                    this.__triangle__lengthCounter = 0;
                                    this.__triangle__linearCounter = this.__triangle__linearCounterBuffer = 0
                                }
                                if (!(U & 8)) {
                                    this.__noize__lengthCounter = 0
                                }
                                if (!(U & 16)) {
                                    this.__digital__sampleLength = 0
                                } else {
                                    if (this.__digital__sampleLength == 0) {
                                        this.__digital__sampleLength = this.__digital__sampleLengthBuffer
                                    }
                                }
                                break;
                            case 22:
                                if ((U & 1) === 1) {
                                    this.__pad__pad1Idx = 0;
                                    this.__pad__pad2Idx = 0
                                }
                                break;
                            case 23:
                                if (U & 128) {
                                    this.__audio__isNTSCmode = false;
                                    this.__audio__frameCnt = 1786360;
                                    this.__audio__frameIRQCnt = 4
                                } else {
                                    this.__audio__isNTSCmode = true;
                                    this.__audio__frameIRQenabled = true;
                                    this.__audio__frameCnt = 1786360;
                                    this.__audio__frameIRQCnt = 3
                                } if ((U & 64) === 64) {
                                    this.__audio__frameIRQenabled = false;
                                    this.IRQ &= 254
                                }
                                break;
                            default:
                                break
                        }
                        break;
                    case 3:
                        break;
                    case 4:
                        this.writeMapperCPU(ak, U);
                        break;
                    case 5:
                        this.writeMapperCPU(ak, U);
                        break;
                    case 6:
                        this.writeMapperCPU(ak, U);
                        break;
                    case 7:
                        this.writeMapperCPU(ak, U);
                        break
                }
                break;
            case 31:
                var au = this.A;
                var ae = this.P;
                this.P = (ae & 254) | ((au & 255) >> 7);
                this.P = (this.P & 125) | H[this.A = (au << 1) | (ae & 1)];
                break;
            case 32:
                var P;
                switch ((ak & 57344) >> 13) {
                    case 0:
                        P = R[ak & 2047];
                        break;
                    case 1:
                        P = this.__video__readReg(ak);
                        break;
                    case 2:
                        if (ak === 16405) {
                            P = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (ak === 16406) {
                                P = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (ak === 16407) {
                                    P = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ak.toString(16))
                                    } else {
                                        P = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        P = 0;
                        break;
                    case 4:
                        P = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 5:
                        P = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 6:
                        P = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 7:
                        P = d[(ak >> 10) & 31][ak & 1023];
                        break
                }
                var ae = this.P;
                var U = (P >> 1) | ((ae & 1) << 7);
                this.P = (ae & 254) | (P & 1);
                this.P = (this.P & 125) | H[U];
                switch ((ak & 57344) >> 13) {
                    case 0:
                        R[ak & 8191] = U;
                        break;
                    case 1:
                        this.__video__writeReg(ak, U);
                        break;
                    case 2:
                        switch (ak & 31) {
                            case 0:
                                this.__rectangle0__decayCounter = this.__rectangle0__volumeOrDecayRate = U & 15;
                                this.__rectangle0__decayEnabled = (U & 16) == 0;
                                this.__rectangle0__loopEnabled = (U & 32) == 32;
                                switch (U >> 6) {
                                    case 0:
                                        this.__rectangle0__dutyRatio = 2;
                                        break;
                                    case 1:
                                        this.__rectangle0__dutyRatio = 4;
                                        break;
                                    case 2:
                                        this.__rectangle0__dutyRatio = 8;
                                        break;
                                    case 3:
                                        this.__rectangle0__dutyRatio = 12;
                                        break
                                }
                                break;
                            case 1:
                                this.__rectangle0__sweepShiftAmount = U & 7;
                                this.__rectangle0__sweepIncreased = (U & 8) === 0;
                                this.__rectangle0__sweepCounter = this.__rectangle0__sweepUpdateRatio = (U >> 4) & 3;
                                this.__rectangle0__sweepEnabled = (U & 128) === 128;
                                break;
                            case 2:
                                this.__rectangle0__frequency = (this.__rectangle0__frequency & 1792) | (U);
                                break;
                            case 3:
                                this.__rectangle0__frequency = (this.__rectangle0__frequency & 255) | ((U & 7) << 8);
                                this.__rectangle0__lengthCounter = this.__audio__LengthCounterConst[U >> 3];
                                this.__rectangle0__dutyCounter = 0;
                                this.__rectangle0__decayReloaded = true;
                                break;
                            case 4:
                                this.__rectangle1__decayCounter = this.__rectangle1__volumeOrDecayRate = U & 15;
                                this.__rectangle1__decayEnabled = (U & 16) == 0;
                                this.__rectangle1__loopEnabled = (U & 32) == 32;
                                switch (U >> 6) {
                                    case 0:
                                        this.__rectangle1__dutyRatio = 2;
                                        break;
                                    case 1:
                                        this.__rectangle1__dutyRatio = 4;
                                        break;
                                    case 2:
                                        this.__rectangle1__dutyRatio = 8;
                                        break;
                                    case 3:
                                        this.__rectangle1__dutyRatio = 12;
                                        break
                                }
                                break;
                            case 5:
                                this.__rectangle1__sweepShiftAmount = U & 7;
                                this.__rectangle1__sweepIncreased = (U & 8) === 0;
                                this.__rectangle1__sweepCounter = this.__rectangle1__sweepUpdateRatio = (U >> 4) & 3;
                                this.__rectangle1__sweepEnabled = (U & 128) === 128;
                                break;
                            case 6:
                                this.__rectangle1__frequency = (this.__rectangle1__frequency & 1792) | (U);
                                break;
                            case 7:
                                this.__rectangle1__frequency = (this.__rectangle1__frequency & 255) | ((U & 7) << 8);
                                this.__rectangle1__lengthCounter = this.__audio__LengthCounterConst[U >> 3];
                                this.__rectangle1__dutyCounter = 0;
                                this.__rectangle1__decayReloaded = true;
                                break;
                            case 8:
                                this.__triangle__enableLinearCounter = ((U & 128) == 128);
                                this.__triangle__linearCounterBuffer = U & 127;
                                break;
                            case 9:
                                break;
                            case 10:
                                this.__triangle__frequency = (this.__triangle__frequency & 1792) | U;
                                break;
                            case 11:
                                this.__triangle__frequency = (this.__triangle__frequency & 255) | ((U & 7) << 8);
                                this.__triangle__lengthCounter = this.__audio__LengthCounterConst[U >> 3];
                                this.__triangle__haltFlag = true;
                                break;
                            case 12:
                                this.__noize__decayCounter = this.__noize__volumeOrDecayRate = U & 15;
                                this.__noize__decayEnabled = (U & 16) == 0;
                                this.__noize__loopEnabled = (U & 32) == 32;
                                break;
                            case 13:
                                break;
                            case 14:
                                this.__noize__modeFlag = (U & 128) == 128;
                                this.__noize__frequency = this.__noize__FrequencyTable[U & 15];
                                break;
                            case 15:
                                this.__noize__lengthCounter = this.__audio__LengthCounterConst[U >> 3];
                                this.__noize__decayReloaded = true;
                                break;
                            case 16:
                                this.__digital__irqEnabled = (U & 128) == 128;
                                if (!this.__digital__irqEnabled) {
                                    this.IRQ &= 253
                                }
                                this.__digital__loopEnabled = (U & 64) == 64;
                                this.__digital__frequency = this.__digital__FrequencyTable[U & 15];
                                break;
                            case 17:
                                this.__digital__deltaCounter = U & 127;
                                break;
                            case 18:
                                this.__digital__sampleAddr = 49152 | (U << 6);
                                break;
                            case 19:
                                this.__digital__sampleLength = this.__digital__sampleLengthBuffer = (U << 4) | 1;
                                break;
                            case 20:
                                var l = U << 8;
                                var z = this.__video__spRam;
                                var ar = this.__video__spriteAddr;
                                for (var aj = 0; aj < 256; ++aj) {
                                    var ah = l | aj;
                                    var h;
                                    switch ((ah & 57344) >> 13) {
                                        case 0:
                                            h = R[ah & 2047];
                                            break;
                                        case 1:
                                            h = this.__video__readReg(ah);
                                            break;
                                        case 2:
                                            if (ah === 16405) {
                                                h = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                                                this.IRQ &= 254;
                                                this.IRQ &= 253
                                            } else {
                                                if (ah === 16406) {
                                                    h = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                                                } else {
                                                    if (ah === 16407) {
                                                        h = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                                    } else {
                                                        if (addr < 16408) {
                                                            throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ah.toString(16))
                                                        } else {
                                                            h = this.readMapperRegisterArea(addr)
                                                        }
                                                    }
                                                }
                                            }
                                            break;
                                        case 3:
                                            h = 0;
                                            break;
                                        case 4:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 5:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 6:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break;
                                        case 7:
                                            h = d[(ah >> 10) & 31][ah & 1023];
                                            break
                                    }
                                    z[(ar + aj) & 255] = h
                                }
                                aa += 512;
                                break;
                            case 21:
                                if (!(U & 1)) {
                                    this.__rectangle0__lengthCounter = 0
                                }
                                if (!(U & 2)) {
                                    this.__rectangle1__lengthCounter = 0
                                }
                                if (!(U & 4)) {
                                    this.__triangle__lengthCounter = 0;
                                    this.__triangle__linearCounter = this.__triangle__linearCounterBuffer = 0
                                }
                                if (!(U & 8)) {
                                    this.__noize__lengthCounter = 0
                                }
                                if (!(U & 16)) {
                                    this.__digital__sampleLength = 0
                                } else {
                                    if (this.__digital__sampleLength == 0) {
                                        this.__digital__sampleLength = this.__digital__sampleLengthBuffer
                                    }
                                }
                                break;
                            case 22:
                                if ((U & 1) === 1) {
                                    this.__pad__pad1Idx = 0;
                                    this.__pad__pad2Idx = 0
                                }
                                break;
                            case 23:
                                if (U & 128) {
                                    this.__audio__isNTSCmode = false;
                                    this.__audio__frameCnt = 1786360;
                                    this.__audio__frameIRQCnt = 4
                                } else {
                                    this.__audio__isNTSCmode = true;
                                    this.__audio__frameIRQenabled = true;
                                    this.__audio__frameCnt = 1786360;
                                    this.__audio__frameIRQCnt = 3
                                } if ((U & 64) === 64) {
                                    this.__audio__frameIRQenabled = false;
                                    this.IRQ &= 254
                                }
                                break;
                            default:
                                break
                        }
                        break;
                    case 3:
                        break;
                    case 4:
                        this.writeMapperCPU(ak, U);
                        break;
                    case 5:
                        this.writeMapperCPU(ak, U);
                        break;
                    case 6:
                        this.writeMapperCPU(ak, U);
                        break;
                    case 7:
                        this.writeMapperCPU(ak, U);
                        break
                }
                break;
            case 33:
                var ae = this.P;
                var au = this.A;
                this.P = (ae & 254) | (au & 1);
                this.P = (this.P & 125) | H[this.A = ((au >> 1) & 127) | ((ae & 1) << 7)];
                break;
            case 34:
                var J = this.P;
                var T = this.A;
                var W;
                switch ((ak & 57344) >> 13) {
                    case 0:
                        W = R[ak & 2047];
                        break;
                    case 1:
                        W = this.__video__readReg(ak);
                        break;
                    case 2:
                        if (ak === 16405) {
                            W = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                            this.IRQ &= 254;
                            this.IRQ &= 253
                        } else {
                            if (ak === 16406) {
                                W = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                            } else {
                                if (ak === 16407) {
                                    W = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                } else {
                                    if (addr < 16408) {
                                        throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + ak.toString(16))
                                    } else {
                                        W = this.readMapperRegisterArea(addr)
                                    }
                                }
                            }
                        }
                        break;
                    case 3:
                        W = 0;
                        break;
                    case 4:
                        W = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 5:
                        W = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 6:
                        W = d[(ak >> 10) & 31][ak & 1023];
                        break;
                    case 7:
                        W = d[(ak >> 10) & 31][ak & 1023];
                        break
                }
                var g = (T - W - ((J & 1) ^ 1)) & 65535;
                var Y = g & 255;
                this.P = (J & 190) | ((T ^ W) & (T ^ Y) & 128) >> 1 | (((g >> 8) & 1) ^ 1);
                this.P = (this.P & 125) | H[this.A = Y];
                break;
            case 35:
                R[256 | (this.SP-- & 255)] = this.A;
                break;
            case 36:
                R[256 | (this.SP-- & 255)] = this.P | 16;
                break;
            case 37:
                this.P = (this.P & 125) | H[this.A = (R[256 | (++this.SP & 255)])];
                break;
            case 38:
                var P = (R[256 | (++this.SP & 255)]);
                if ((this.P & 4) && !(P & 4)) {
                    this.needStatusRewrite = true;
                    this.newStatus = P
                } else {
                    this.P = P
                }
                break;
            case 39:
                this.P &= (254);
                break;
            case 40:
                this.P &= (247);
                break;
            case 41:
                this.needStatusRewrite = true;
                this.newStatus = this.P & (251);
                break;
            case 42:
                this.P &= (191);
                break;
            case 43:
                this.P |= 1;
                break;
            case 44:
                this.P |= 8;
                break;
            case 45:
                this.P |= 4;
                break;
            case 46:
                this.PC++;
                R[256 | (this.SP-- & 255)] = this.PC >> 8;
                R[256 | (this.SP-- & 255)] = this.PC;
                this.P |= 16;
                R[256 | (this.SP-- & 255)] = (this.P);
                this.P |= 4;
                this.PC = (rom[31][1022] | (rom[31][1023] << 8));
                break;
            case 47:
                break;
            case 48:
                this.PC = ((R[256 | (++this.SP & 255)]) | ((R[256 | (++this.SP & 255)]) << 8)) + 1;
                break;
            case 49:
                this.P = (R[256 | (++this.SP & 255)]);
                this.PC = (R[256 | (++this.SP & 255)]) | ((R[256 | (++this.SP & 255)]) << 8);
                break;
            case 50:
                this.PC = ak;
                break;
            case 51:
                var K = this.PC - 1;
                R[256 | (this.SP-- & 255)] = K >> 8;
                R[256 | (this.SP-- & 255)] = K;
                this.PC = ak;
                break;
            case 52:
                if (!(this.P & 1)) {
                    aa += ((((this.PC ^ ak) & 256) !== 0) ? 2 : 1);
                    this.PC = ak
                }
                break;
            case 53:
                if (this.P & 1) {
                    aa += ((((this.PC ^ ak) & 256) !== 0) ? 2 : 1);
                    this.PC = ak
                }
                break;
            case 54:
                if (this.P & 2) {
                    aa += ((((this.PC ^ ak) & 256) !== 0) ? 2 : 1);
                    this.PC = ak
                }
                break;
            case 55:
                if (this.P & 128) {
                    aa += ((((this.PC ^ ak) & 256) !== 0) ? 2 : 1);
                    this.PC = ak
                }
                break;
            case 56:
                if (!(this.P & 2)) {
                    aa += ((((this.PC ^ ak) & 256) !== 0) ? 2 : 1);
                    this.PC = ak
                }
                break;
            case 57:
                if (!(this.P & 128)) {
                    aa += ((((this.PC ^ ak) & 256) !== 0) ? 2 : 1);
                    this.PC = ak
                }
                break;
            case 58:
                if (!(this.P & 64)) {
                    aa += ((((this.PC ^ ak) & 256) !== 0) ? 2 : 1);
                    this.PC = ak
                }
                break;
            case 59:
                if (this.P & 64) {
                    aa += ((((this.PC ^ ak) & 256) !== 0) ? 2 : 1);
                    this.PC = ak
                }
                break
        }
        aa += (j >> 16);
        this.__video__nowX += aa * 3;
        while (this.__video__nowX >= 341) {
            this.__video__nowX -= 341;
            var I = (++this.__video__nowY);
            if (I <= 240) {
                this.__video__spriteEval();
                if (this.__video__backgroundVisibility || this.__video__spriteVisibility) {
                    this.__video__vramAddrRegister = (this.__video__vramAddrRegister & 31712) | (this.__video__vramAddrReloadRegister & 1055);
                    this.__video__buildBgLine();
                    this.__video__buildSpriteLine();
                    var f = this.__video__vramAddrRegister + (1 << 12);
                    f += (f & 32768) >> 10;
                    f &= 32767;
                    if ((f & 992) === 960) {
                        f &= 64543;
                        f ^= 2048
                    }
                    this.__video__vramAddrRegister = f
                }
            } else {
                if (I === 241) {
                    this.__video__videoFairy.dispatchRendering(ab, this.__video__paletteMask);
                    ao = false;
                    this.__video__nowOnVBnank = true;
                    this.__video__spriteAddr = 0
                } else {
                    if (I === 242) {
                        this.NMI = this.__video__executeNMIonVBlank;
                        this.onVBlank()
                    } else {
                        if (I <= 261) {} else {
                            if (I === 262) {
                                this.__video__nowOnVBnank = false;
                                this.__video__sprite0Hit = false;
                                this.__video__nowY = 0;
                                if (!this.__video__isEven) {
                                    this.__video__nowX++
                                }
                                this.__video__isEven = !this.__video__isEven;
                                if (this.__video__backgroundVisibility || this.__video__spriteVisibility) {
                                    this.__video__vramAddrRegister = (this.__video__vramAddrRegister & 1055) | (this.__video__vramAddrReloadRegister & 31712)
                                }
                            } else {
                                throw new cycloa.err.CoreException("Invalid scanline: " + this.__video__nowY)
                            }
                        }
                    }
                }
            }
        }
        this.__audio__frameCnt += (aa * 240);
        while (this.__audio__frameCnt >= 1786840) {
            this.__audio__frameCnt -= 1786840;
            if (this.__audio__isNTSCmode) {
                this.__audio__frameIRQCnt++;
                switch (this.__audio__frameIRQCnt) {
                    case 1:
                        if (this.__rectangle1__decayCounter === 0) {
                            this.__rectangle1__decayCounter = this.__rectangle1__volumeOrDecayRate;
                            if (this.__rectangle1__decayVolume === 0) {
                                if (this.__rectangle1__loopEnabled) {
                                    this.__rectangle1__decayVolume = 15
                                }
                            } else {
                                this.__rectangle1__decayVolume--
                            }
                        } else {
                            this.__rectangle1__decayCounter--
                        } if (this.__rectangle1__decayReloaded) {
                            this.__rectangle1__decayReloaded = false;
                            this.__rectangle1__decayVolume = 15
                        }
                        if (this.__rectangle0__decayCounter === 0) {
                            this.__rectangle0__decayCounter = this.__rectangle0__volumeOrDecayRate;
                            if (this.__rectangle0__decayVolume === 0) {
                                if (this.__rectangle0__loopEnabled) {
                                    this.__rectangle0__decayVolume = 15
                                }
                            } else {
                                this.__rectangle0__decayVolume--
                            }
                        } else {
                            this.__rectangle0__decayCounter--
                        } if (this.__rectangle0__decayReloaded) {
                            this.__rectangle0__decayReloaded = false;
                            this.__rectangle0__decayVolume = 15
                        }
                        if (this.__triangle__haltFlag) {
                            this.__triangle__linearCounter = this.__triangle__linearCounterBuffer
                        } else {
                            if (this.__triangle__linearCounter != 0) {
                                this.__triangle__linearCounter--
                            }
                        } if (!this.__triangle__enableLinearCounter) {
                            this.__triangle__haltFlag = false
                        }
                        if (this.__noize__decayCounter == 0) {
                            this.__noize__decayCounter = this.__noize__volumeOrDecayRate;
                            if (this.__noize__decayVolume == 0) {
                                if (this.__noize__loopEnabled) {
                                    this.__noize__decayVolume = 15
                                }
                            } else {
                                this.__noize__decayVolume--
                            }
                        } else {
                            this.__noize__decayCounter--
                        } if (this.__noize__decayReloaded) {
                            this.__noize__decayReloaded = false;
                            this.__noize__decayVolume = 15
                        }
                        break;
                    case 2:
                        if (this.__rectangle1__decayCounter === 0) {
                            this.__rectangle1__decayCounter = this.__rectangle1__volumeOrDecayRate;
                            if (this.__rectangle1__decayVolume === 0) {
                                if (this.__rectangle1__loopEnabled) {
                                    this.__rectangle1__decayVolume = 15
                                }
                            } else {
                                this.__rectangle1__decayVolume--
                            }
                        } else {
                            this.__rectangle1__decayCounter--
                        } if (this.__rectangle1__decayReloaded) {
                            this.__rectangle1__decayReloaded = false;
                            this.__rectangle1__decayVolume = 15
                        }
                        if (this.__rectangle0__decayCounter === 0) {
                            this.__rectangle0__decayCounter = this.__rectangle0__volumeOrDecayRate;
                            if (this.__rectangle0__decayVolume === 0) {
                                if (this.__rectangle0__loopEnabled) {
                                    this.__rectangle0__decayVolume = 15
                                }
                            } else {
                                this.__rectangle0__decayVolume--
                            }
                        } else {
                            this.__rectangle0__decayCounter--
                        } if (this.__rectangle0__decayReloaded) {
                            this.__rectangle0__decayReloaded = false;
                            this.__rectangle0__decayVolume = 15
                        }
                        if (this.__triangle__haltFlag) {
                            this.__triangle__linearCounter = this.__triangle__linearCounterBuffer
                        } else {
                            if (this.__triangle__linearCounter != 0) {
                                this.__triangle__linearCounter--
                            }
                        } if (!this.__triangle__enableLinearCounter) {
                            this.__triangle__haltFlag = false
                        }
                        if (this.__noize__decayCounter == 0) {
                            this.__noize__decayCounter = this.__noize__volumeOrDecayRate;
                            if (this.__noize__decayVolume == 0) {
                                if (this.__noize__loopEnabled) {
                                    this.__noize__decayVolume = 15
                                }
                            } else {
                                this.__noize__decayVolume--
                            }
                        } else {
                            this.__noize__decayCounter--
                        } if (this.__noize__decayReloaded) {
                            this.__noize__decayReloaded = false;
                            this.__noize__decayVolume = 15
                        }
                        if (this.__rectangle1__lengthCounter != 0 && !this.__rectangle1__loopEnabled) {
                            this.__rectangle1__lengthCounter--
                        }
                        if (this.__rectangle1__sweepEnabled) {
                            if (this.__rectangle1__sweepCounter == 0) {
                                this.__rectangle1__sweepCounter = this.__rectangle1__sweepUpdateRatio;
                                if (this.__rectangle1__lengthCounter != 0 && this.__rectangle1__sweepShiftAmount != 0) {
                                    var ag = (this.__rectangle1__frequency >> this.__rectangle1__sweepShiftAmount);
                                    if (this.__rectangle1__sweepIncreased) {
                                        this.__rectangle1__frequency += ag
                                    } else {
                                        this.__rectangle1__frequency -= ag
                                    }
                                }
                            } else {
                                this.__rectangle1__sweepCounter--
                            }
                        }
                        if (this.__rectangle0__lengthCounter != 0 && !this.__rectangle0__loopEnabled) {
                            this.__rectangle0__lengthCounter--
                        }
                        if (this.__rectangle0__sweepEnabled) {
                            if (this.__rectangle0__sweepCounter == 0) {
                                this.__rectangle0__sweepCounter = this.__rectangle0__sweepUpdateRatio;
                                if (this.__rectangle0__lengthCounter != 0 && this.__rectangle0__sweepShiftAmount != 0) {
                                    var ad = (this.__rectangle0__frequency >> this.__rectangle0__sweepShiftAmount);
                                    if (this.__rectangle0__sweepIncreased) {
                                        this.__rectangle0__frequency += ad
                                    } else {
                                        this.__rectangle0__frequency -= ad;
                                        this.__rectangle0__frequency--
                                    }
                                }
                            } else {
                                this.__rectangle0__sweepCounter--
                            }
                        }
                        if (this.__triangle__lengthCounter != 0 && !this.__triangle__enableLinearCounter) {
                            this.__triangle__lengthCounter--
                        }
                        if (this.__noize__lengthCounter != 0 && !this.__noize__loopEnabled) {
                            this.__noize__lengthCounter--
                        }
                        break;
                    case 3:
                        if (this.__rectangle1__decayCounter === 0) {
                            this.__rectangle1__decayCounter = this.__rectangle1__volumeOrDecayRate;
                            if (this.__rectangle1__decayVolume === 0) {
                                if (this.__rectangle1__loopEnabled) {
                                    this.__rectangle1__decayVolume = 15
                                }
                            } else {
                                this.__rectangle1__decayVolume--
                            }
                        } else {
                            this.__rectangle1__decayCounter--
                        } if (this.__rectangle1__decayReloaded) {
                            this.__rectangle1__decayReloaded = false;
                            this.__rectangle1__decayVolume = 15
                        }
                        if (this.__rectangle0__decayCounter === 0) {
                            this.__rectangle0__decayCounter = this.__rectangle0__volumeOrDecayRate;
                            if (this.__rectangle0__decayVolume === 0) {
                                if (this.__rectangle0__loopEnabled) {
                                    this.__rectangle0__decayVolume = 15
                                }
                            } else {
                                this.__rectangle0__decayVolume--
                            }
                        } else {
                            this.__rectangle0__decayCounter--
                        } if (this.__rectangle0__decayReloaded) {
                            this.__rectangle0__decayReloaded = false;
                            this.__rectangle0__decayVolume = 15
                        }
                        if (this.__triangle__haltFlag) {
                            this.__triangle__linearCounter = this.__triangle__linearCounterBuffer
                        } else {
                            if (this.__triangle__linearCounter != 0) {
                                this.__triangle__linearCounter--
                            }
                        } if (!this.__triangle__enableLinearCounter) {
                            this.__triangle__haltFlag = false
                        }
                        if (this.__noize__decayCounter == 0) {
                            this.__noize__decayCounter = this.__noize__volumeOrDecayRate;
                            if (this.__noize__decayVolume == 0) {
                                if (this.__noize__loopEnabled) {
                                    this.__noize__decayVolume = 15
                                }
                            } else {
                                this.__noize__decayVolume--
                            }
                        } else {
                            this.__noize__decayCounter--
                        } if (this.__noize__decayReloaded) {
                            this.__noize__decayReloaded = false;
                            this.__noize__decayVolume = 15
                        }
                        break;
                    case 4:
                        if (this.__rectangle1__decayCounter === 0) {
                            this.__rectangle1__decayCounter = this.__rectangle1__volumeOrDecayRate;
                            if (this.__rectangle1__decayVolume === 0) {
                                if (this.__rectangle1__loopEnabled) {
                                    this.__rectangle1__decayVolume = 15
                                }
                            } else {
                                this.__rectangle1__decayVolume--
                            }
                        } else {
                            this.__rectangle1__decayCounter--
                        } if (this.__rectangle1__decayReloaded) {
                            this.__rectangle1__decayReloaded = false;
                            this.__rectangle1__decayVolume = 15
                        }
                        if (this.__rectangle0__decayCounter === 0) {
                            this.__rectangle0__decayCounter = this.__rectangle0__volumeOrDecayRate;
                            if (this.__rectangle0__decayVolume === 0) {
                                if (this.__rectangle0__loopEnabled) {
                                    this.__rectangle0__decayVolume = 15
                                }
                            } else {
                                this.__rectangle0__decayVolume--
                            }
                        } else {
                            this.__rectangle0__decayCounter--
                        } if (this.__rectangle0__decayReloaded) {
                            this.__rectangle0__decayReloaded = false;
                            this.__rectangle0__decayVolume = 15
                        }
                        if (this.__triangle__haltFlag) {
                            this.__triangle__linearCounter = this.__triangle__linearCounterBuffer
                        } else {
                            if (this.__triangle__linearCounter != 0) {
                                this.__triangle__linearCounter--
                            }
                        } if (!this.__triangle__enableLinearCounter) {
                            this.__triangle__haltFlag = false
                        }
                        if (this.__noize__decayCounter == 0) {
                            this.__noize__decayCounter = this.__noize__volumeOrDecayRate;
                            if (this.__noize__decayVolume == 0) {
                                if (this.__noize__loopEnabled) {
                                    this.__noize__decayVolume = 15
                                }
                            } else {
                                this.__noize__decayVolume--
                            }
                        } else {
                            this.__noize__decayCounter--
                        } if (this.__noize__decayReloaded) {
                            this.__noize__decayReloaded = false;
                            this.__noize__decayVolume = 15
                        }
                        if (this.__rectangle1__lengthCounter != 0 && !this.__rectangle1__loopEnabled) {
                            this.__rectangle1__lengthCounter--
                        }
                        if (this.__rectangle1__sweepEnabled) {
                            if (this.__rectangle1__sweepCounter == 0) {
                                this.__rectangle1__sweepCounter = this.__rectangle1__sweepUpdateRatio;
                                if (this.__rectangle1__lengthCounter != 0 && this.__rectangle1__sweepShiftAmount != 0) {
                                    var ag = (this.__rectangle1__frequency >> this.__rectangle1__sweepShiftAmount);
                                    if (this.__rectangle1__sweepIncreased) {
                                        this.__rectangle1__frequency += ag
                                    } else {
                                        this.__rectangle1__frequency -= ag
                                    }
                                }
                            } else {
                                this.__rectangle1__sweepCounter--
                            }
                        }
                        if (this.__rectangle0__lengthCounter != 0 && !this.__rectangle0__loopEnabled) {
                            this.__rectangle0__lengthCounter--
                        }
                        if (this.__rectangle0__sweepEnabled) {
                            if (this.__rectangle0__sweepCounter == 0) {
                                this.__rectangle0__sweepCounter = this.__rectangle0__sweepUpdateRatio;
                                if (this.__rectangle0__lengthCounter != 0 && this.__rectangle0__sweepShiftAmount != 0) {
                                    var ad = (this.__rectangle0__frequency >> this.__rectangle0__sweepShiftAmount);
                                    if (this.__rectangle0__sweepIncreased) {
                                        this.__rectangle0__frequency += ad
                                    } else {
                                        this.__rectangle0__frequency -= ad;
                                        this.__rectangle0__frequency--
                                    }
                                }
                            } else {
                                this.__rectangle0__sweepCounter--
                            }
                        }
                        if (this.__triangle__lengthCounter != 0 && !this.__triangle__enableLinearCounter) {
                            this.__triangle__lengthCounter--
                        }
                        if (this.__noize__lengthCounter != 0 && !this.__noize__loopEnabled) {
                            this.__noize__lengthCounter--
                        }
                        if (this.__audio__frameIRQenabled) {
                            this.IRQ |= 1
                        }
                        this.__audio__frameIRQCnt = 0;
                        break;
                    default:
                        throw new cycloa.err.CoreException("FIXME Audio::run interrupt NTSC")
                }
            } else {
                this.__audio__frameIRQCnt++;
                switch (this.__audio__frameIRQCnt) {
                    case 1:
                        if (this.__rectangle1__decayCounter === 0) {
                            this.__rectangle1__decayCounter = this.__rectangle1__volumeOrDecayRate;
                            if (this.__rectangle1__decayVolume === 0) {
                                if (this.__rectangle1__loopEnabled) {
                                    this.__rectangle1__decayVolume = 15
                                }
                            } else {
                                this.__rectangle1__decayVolume--
                            }
                        } else {
                            this.__rectangle1__decayCounter--
                        } if (this.__rectangle1__decayReloaded) {
                            this.__rectangle1__decayReloaded = false;
                            this.__rectangle1__decayVolume = 15
                        }
                        if (this.__rectangle0__decayCounter === 0) {
                            this.__rectangle0__decayCounter = this.__rectangle0__volumeOrDecayRate;
                            if (this.__rectangle0__decayVolume === 0) {
                                if (this.__rectangle0__loopEnabled) {
                                    this.__rectangle0__decayVolume = 15
                                }
                            } else {
                                this.__rectangle0__decayVolume--
                            }
                        } else {
                            this.__rectangle0__decayCounter--
                        } if (this.__rectangle0__decayReloaded) {
                            this.__rectangle0__decayReloaded = false;
                            this.__rectangle0__decayVolume = 15
                        }
                        if (this.__triangle__haltFlag) {
                            this.__triangle__linearCounter = this.__triangle__linearCounterBuffer
                        } else {
                            if (this.__triangle__linearCounter != 0) {
                                this.__triangle__linearCounter--
                            }
                        } if (!this.__triangle__enableLinearCounter) {
                            this.__triangle__haltFlag = false
                        }
                        if (this.__noize__decayCounter == 0) {
                            this.__noize__decayCounter = this.__noize__volumeOrDecayRate;
                            if (this.__noize__decayVolume == 0) {
                                if (this.__noize__loopEnabled) {
                                    this.__noize__decayVolume = 15
                                }
                            } else {
                                this.__noize__decayVolume--
                            }
                        } else {
                            this.__noize__decayCounter--
                        } if (this.__noize__decayReloaded) {
                            this.__noize__decayReloaded = false;
                            this.__noize__decayVolume = 15
                        }
                        break;
                    case 2:
                        if (this.__rectangle1__decayCounter === 0) {
                            this.__rectangle1__decayCounter = this.__rectangle1__volumeOrDecayRate;
                            if (this.__rectangle1__decayVolume === 0) {
                                if (this.__rectangle1__loopEnabled) {
                                    this.__rectangle1__decayVolume = 15
                                }
                            } else {
                                this.__rectangle1__decayVolume--
                            }
                        } else {
                            this.__rectangle1__decayCounter--
                        } if (this.__rectangle1__decayReloaded) {
                            this.__rectangle1__decayReloaded = false;
                            this.__rectangle1__decayVolume = 15
                        }
                        if (this.__rectangle0__decayCounter === 0) {
                            this.__rectangle0__decayCounter = this.__rectangle0__volumeOrDecayRate;
                            if (this.__rectangle0__decayVolume === 0) {
                                if (this.__rectangle0__loopEnabled) {
                                    this.__rectangle0__decayVolume = 15
                                }
                            } else {
                                this.__rectangle0__decayVolume--
                            }
                        } else {
                            this.__rectangle0__decayCounter--
                        } if (this.__rectangle0__decayReloaded) {
                            this.__rectangle0__decayReloaded = false;
                            this.__rectangle0__decayVolume = 15
                        }
                        if (this.__triangle__haltFlag) {
                            this.__triangle__linearCounter = this.__triangle__linearCounterBuffer
                        } else {
                            if (this.__triangle__linearCounter != 0) {
                                this.__triangle__linearCounter--
                            }
                        } if (!this.__triangle__enableLinearCounter) {
                            this.__triangle__haltFlag = false
                        }
                        if (this.__noize__decayCounter == 0) {
                            this.__noize__decayCounter = this.__noize__volumeOrDecayRate;
                            if (this.__noize__decayVolume == 0) {
                                if (this.__noize__loopEnabled) {
                                    this.__noize__decayVolume = 15
                                }
                            } else {
                                this.__noize__decayVolume--
                            }
                        } else {
                            this.__noize__decayCounter--
                        } if (this.__noize__decayReloaded) {
                            this.__noize__decayReloaded = false;
                            this.__noize__decayVolume = 15
                        }
                        if (this.__rectangle1__lengthCounter != 0 && !this.__rectangle1__loopEnabled) {
                            this.__rectangle1__lengthCounter--
                        }
                        if (this.__rectangle1__sweepEnabled) {
                            if (this.__rectangle1__sweepCounter == 0) {
                                this.__rectangle1__sweepCounter = this.__rectangle1__sweepUpdateRatio;
                                if (this.__rectangle1__lengthCounter != 0 && this.__rectangle1__sweepShiftAmount != 0) {
                                    var ag = (this.__rectangle1__frequency >> this.__rectangle1__sweepShiftAmount);
                                    if (this.__rectangle1__sweepIncreased) {
                                        this.__rectangle1__frequency += ag
                                    } else {
                                        this.__rectangle1__frequency -= ag
                                    }
                                }
                            } else {
                                this.__rectangle1__sweepCounter--
                            }
                        }
                        if (this.__rectangle0__lengthCounter != 0 && !this.__rectangle0__loopEnabled) {
                            this.__rectangle0__lengthCounter--
                        }
                        if (this.__rectangle0__sweepEnabled) {
                            if (this.__rectangle0__sweepCounter == 0) {
                                this.__rectangle0__sweepCounter = this.__rectangle0__sweepUpdateRatio;
                                if (this.__rectangle0__lengthCounter != 0 && this.__rectangle0__sweepShiftAmount != 0) {
                                    var ad = (this.__rectangle0__frequency >> this.__rectangle0__sweepShiftAmount);
                                    if (this.__rectangle0__sweepIncreased) {
                                        this.__rectangle0__frequency += ad
                                    } else {
                                        this.__rectangle0__frequency -= ad;
                                        this.__rectangle0__frequency--
                                    }
                                }
                            } else {
                                this.__rectangle0__sweepCounter--
                            }
                        }
                        if (this.__triangle__lengthCounter != 0 && !this.__triangle__enableLinearCounter) {
                            this.__triangle__lengthCounter--
                        }
                        if (this.__noize__lengthCounter != 0 && !this.__noize__loopEnabled) {
                            this.__noize__lengthCounter--
                        }
                        break;
                    case 3:
                        if (this.__rectangle1__decayCounter === 0) {
                            this.__rectangle1__decayCounter = this.__rectangle1__volumeOrDecayRate;
                            if (this.__rectangle1__decayVolume === 0) {
                                if (this.__rectangle1__loopEnabled) {
                                    this.__rectangle1__decayVolume = 15
                                }
                            } else {
                                this.__rectangle1__decayVolume--
                            }
                        } else {
                            this.__rectangle1__decayCounter--
                        } if (this.__rectangle1__decayReloaded) {
                            this.__rectangle1__decayReloaded = false;
                            this.__rectangle1__decayVolume = 15
                        }
                        if (this.__rectangle0__decayCounter === 0) {
                            this.__rectangle0__decayCounter = this.__rectangle0__volumeOrDecayRate;
                            if (this.__rectangle0__decayVolume === 0) {
                                if (this.__rectangle0__loopEnabled) {
                                    this.__rectangle0__decayVolume = 15
                                }
                            } else {
                                this.__rectangle0__decayVolume--
                            }
                        } else {
                            this.__rectangle0__decayCounter--
                        } if (this.__rectangle0__decayReloaded) {
                            this.__rectangle0__decayReloaded = false;
                            this.__rectangle0__decayVolume = 15
                        }
                        if (this.__triangle__haltFlag) {
                            this.__triangle__linearCounter = this.__triangle__linearCounterBuffer
                        } else {
                            if (this.__triangle__linearCounter != 0) {
                                this.__triangle__linearCounter--
                            }
                        } if (!this.__triangle__enableLinearCounter) {
                            this.__triangle__haltFlag = false
                        }
                        if (this.__noize__decayCounter == 0) {
                            this.__noize__decayCounter = this.__noize__volumeOrDecayRate;
                            if (this.__noize__decayVolume == 0) {
                                if (this.__noize__loopEnabled) {
                                    this.__noize__decayVolume = 15
                                }
                            } else {
                                this.__noize__decayVolume--
                            }
                        } else {
                            this.__noize__decayCounter--
                        } if (this.__noize__decayReloaded) {
                            this.__noize__decayReloaded = false;
                            this.__noize__decayVolume = 15
                        }
                        break;
                    case 4:
                        break;
                    case 5:
                        if (this.__rectangle1__decayCounter === 0) {
                            this.__rectangle1__decayCounter = this.__rectangle1__volumeOrDecayRate;
                            if (this.__rectangle1__decayVolume === 0) {
                                if (this.__rectangle1__loopEnabled) {
                                    this.__rectangle1__decayVolume = 15
                                }
                            } else {
                                this.__rectangle1__decayVolume--
                            }
                        } else {
                            this.__rectangle1__decayCounter--
                        } if (this.__rectangle1__decayReloaded) {
                            this.__rectangle1__decayReloaded = false;
                            this.__rectangle1__decayVolume = 15
                        }
                        if (this.__rectangle0__decayCounter === 0) {
                            this.__rectangle0__decayCounter = this.__rectangle0__volumeOrDecayRate;
                            if (this.__rectangle0__decayVolume === 0) {
                                if (this.__rectangle0__loopEnabled) {
                                    this.__rectangle0__decayVolume = 15
                                }
                            } else {
                                this.__rectangle0__decayVolume--
                            }
                        } else {
                            this.__rectangle0__decayCounter--
                        } if (this.__rectangle0__decayReloaded) {
                            this.__rectangle0__decayReloaded = false;
                            this.__rectangle0__decayVolume = 15
                        }
                        if (this.__triangle__haltFlag) {
                            this.__triangle__linearCounter = this.__triangle__linearCounterBuffer
                        } else {
                            if (this.__triangle__linearCounter != 0) {
                                this.__triangle__linearCounter--
                            }
                        } if (!this.__triangle__enableLinearCounter) {
                            this.__triangle__haltFlag = false
                        }
                        if (this.__noize__decayCounter == 0) {
                            this.__noize__decayCounter = this.__noize__volumeOrDecayRate;
                            if (this.__noize__decayVolume == 0) {
                                if (this.__noize__loopEnabled) {
                                    this.__noize__decayVolume = 15
                                }
                            } else {
                                this.__noize__decayVolume--
                            }
                        } else {
                            this.__noize__decayCounter--
                        } if (this.__noize__decayReloaded) {
                            this.__noize__decayReloaded = false;
                            this.__noize__decayVolume = 15
                        }
                        if (this.__rectangle1__lengthCounter != 0 && !this.__rectangle1__loopEnabled) {
                            this.__rectangle1__lengthCounter--
                        }
                        if (this.__rectangle1__sweepEnabled) {
                            if (this.__rectangle1__sweepCounter == 0) {
                                this.__rectangle1__sweepCounter = this.__rectangle1__sweepUpdateRatio;
                                if (this.__rectangle1__lengthCounter != 0 && this.__rectangle1__sweepShiftAmount != 0) {
                                    var ag = (this.__rectangle1__frequency >> this.__rectangle1__sweepShiftAmount);
                                    if (this.__rectangle1__sweepIncreased) {
                                        this.__rectangle1__frequency += ag
                                    } else {
                                        this.__rectangle1__frequency -= ag
                                    }
                                }
                            } else {
                                this.__rectangle1__sweepCounter--
                            }
                        }
                        if (this.__rectangle0__lengthCounter != 0 && !this.__rectangle0__loopEnabled) {
                            this.__rectangle0__lengthCounter--
                        }
                        if (this.__rectangle0__sweepEnabled) {
                            if (this.__rectangle0__sweepCounter == 0) {
                                this.__rectangle0__sweepCounter = this.__rectangle0__sweepUpdateRatio;
                                if (this.__rectangle0__lengthCounter != 0 && this.__rectangle0__sweepShiftAmount != 0) {
                                    var ad = (this.__rectangle0__frequency >> this.__rectangle0__sweepShiftAmount);
                                    if (this.__rectangle0__sweepIncreased) {
                                        this.__rectangle0__frequency += ad
                                    } else {
                                        this.__rectangle0__frequency -= ad;
                                        this.__rectangle0__frequency--
                                    }
                                }
                            } else {
                                this.__rectangle0__sweepCounter--
                            }
                        }
                        if (this.__triangle__lengthCounter != 0 && !this.__triangle__enableLinearCounter) {
                            this.__triangle__lengthCounter--
                        }
                        if (this.__noize__lengthCounter != 0 && !this.__noize__loopEnabled) {
                            this.__noize__lengthCounter--
                        }
                        this.__audio__frameIRQCnt = 0;
                        break;
                    default:
                        throw new cycloa.err.CoreException("FIXME Audio::run interrupt PAL")
                }
            }
        }
        this.__audio__clockCnt += (aa * 22050);
        while (this.__audio__clockCnt >= 1786840) {
            var e = 1786840 + this.__audio__leftClock;
            var G = (e / 22050) | 0;
            this.__audio__leftClock = e % 22050;
            this.__audio__clockCnt -= 1786840;
            var B = 0;
            if (this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency <= 2047) {
                var an = this.__rectangle1__freqCounter + G;
                this.__rectangle1__freqCounter = an % (this.__rectangle1__frequency + 1);
                this.__rectangle1__dutyCounter = (this.__rectangle1__dutyCounter + (an / (this.__rectangle1__frequency + 1))) & 15;
                if (this.__rectangle1__dutyCounter < this.__rectangle1__dutyRatio) {
                    B += this.__rectangle1__decayEnabled ? this.__rectangle1__decayVolume : this.__rectangle1__volumeOrDecayRate
                } else {
                    B += this.__rectangle1__decayEnabled ? -this.__rectangle1__decayVolume : -this.__rectangle1__volumeOrDecayRate
                }
            }
            if (this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency <= 2047) {
                var u = this.__rectangle0__freqCounter + G;
                this.__rectangle0__freqCounter = u % (this.__rectangle0__frequency + 1);
                this.__rectangle0__dutyCounter = (this.__rectangle0__dutyCounter + (u / (this.__rectangle0__frequency + 1))) & 15;
                if (this.__rectangle0__dutyCounter < this.__rectangle0__dutyRatio) {
                    B += this.__rectangle0__decayEnabled ? this.__rectangle0__decayVolume : this.__rectangle0__volumeOrDecayRate
                } else {
                    B += this.__rectangle0__decayEnabled ? -this.__rectangle0__decayVolume : -this.__rectangle0__volumeOrDecayRate
                }
            }
            if (this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) {
                var n = this.__triangle__freqCounter + G;
                var af = this.__triangle__frequency + 1;
                this.__triangle__freqCounter = n % af;
                B += this.__triangle__waveForm[this.__triangle__streamCounter = (this.__triangle__streamCounter + (n / af)) & 31]
            }
            if (this.__noize__lengthCounter != 0) {
                var ap = this.__noize__freqCounter + G;
                var X = this.__noize__frequency + 1;
                var D = this.__noize__modeFlag ? 6 : 1;
                var V = this.__noize__shiftRegister;
                while (ap >= X) {
                    ap -= X;
                    V = (V >> 1) | (((V ^ (V >> D)) & 1) << 14)
                }
                if (((V & 1) == 1)) {
                    B += this.__noize__decayEnabled ? -this.__noize__decayVolume : -this.__noize__volumeOrDecayRate
                } else {
                    B += this.__noize__decayEnabled ? this.__noize__decayVolume : this.__noize__volumeOrDecayRate
                }
                this.__noize__freqCounter = ap;
                this.__noize__shiftRegister = V
            }
            if (this.__digital__sampleLength != 0) {
                var b = this.__digital__freqCounter + G;
                var x = this.__digital__frequency + 1;
                while (b >= x) {
                    b -= divFreq;
                    if (this.__digital__sampleBufferLeft == 0) {
                        this.__digital__sampleLength--;
                        var A;
                        var Q = this.__digital__sampleAddr;
                        switch ((Q & 57344) >> 13) {
                            case 0:
                                __digitl__val__ = R[Q & 2047];
                                break;
                            case 1:
                                __digitl__val__ = this.__video__readReg(Q);
                                break;
                            case 2:
                                if (Q === 16405) {
                                    __digitl__val__ = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                                    this.IRQ &= 254;
                                    this.IRQ &= 253
                                } else {
                                    if (Q === 16406) {
                                        __digitl__val__ = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                                    } else {
                                        if (Q === 16407) {
                                            __digitl__val__ = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                        } else {
                                            if (addr < 16408) {
                                                throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + Q.toString(16))
                                            } else {
                                                __digitl__val__ = this.readMapperRegisterArea(addr)
                                            }
                                        }
                                    }
                                }
                                break;
                            case 3:
                                __digitl__val__ = 0;
                                break;
                            case 4:
                                __digitl__val__ = d[(Q >> 10) & 31][Q & 1023];
                                break;
                            case 5:
                                __digitl__val__ = d[(Q >> 10) & 31][Q & 1023];
                                break;
                            case 6:
                                __digitl__val__ = d[(Q >> 10) & 31][Q & 1023];
                                break;
                            case 7:
                                __digitl__val__ = d[(Q >> 10) & 31][Q & 1023];
                                break
                        }
                        this.__digital__sampleBuffer = __digitl__val__;
                        if (this.__digital__sampleAddr >= 65535) {
                            this.__digital__sampleAddr = 32768
                        } else {
                            this.__digital__sampleAddr++
                        }
                        this.__digital__sampleBufferLeft = 7;
                        ai += (4);
                        if (this.__digital__sampleLength == 0) {
                            if (this.__digital__loopEnabled) {
                                this.__digital__sampleLength = this.__digital__sampleLengthBuffer
                            } else {
                                if (this.__digital__irqEnabled) {
                                    this.IRQ |= 2
                                } else {
                                    break
                                }
                            }
                        }
                    }
                    this.__digital__sampleBuffer = this.__digital__sampleBuffer >> 1;
                    if ((this.__digital__sampleBuffer & 1) == 1) {
                        if (this.__digital__deltaCounter < 126) {
                            this.__digital__deltaCounter += 2
                        }
                    } else {
                        if (this.__digital__deltaCounter > 1) {
                            this.__digital__deltaCounter -= 2
                        }
                    }
                    this.__digital__sampleBufferLeft--
                }
                this.__digital__freqCounter = __digitl__nowCounter;
                B += this.__digital__deltaCounter
            }
            if (c) {
                M[at.dataIndex++] = B / 100;
                if (at.dataIndex >= k) {
                    at.onDataFilled();
                    M = at.data
                }
            }
        }
    }
    this.__vm__reservedClockDelta += ai;
    return ao
};
cycloa.VirtualMachine.prototype.onHardReset = function() {
    this.NMI = false;
    this.IRQ = 0;
    this.onHardResetCPU();
    this.__video__onHardReset();
    this.__audio__onHardReset();
    this.__rectangle0__onHardReset();
    this.__rectangle1__onHardReset();
    this.__triangle__onHardReset();
    this.__noize__onHardReset();
    this.__digital__onHardReset()
};
cycloa.VirtualMachine.prototype.onReset = function() {
    this.NMI = false;
    this.IRQ = 0;
    this.onResetCPU();
    this.__video__onReset();
    this.__audio__onReset();
    this.__rectangle0__onReset();
    this.__rectangle1__onReset();
    this.__triangle__onReset();
    this.__noize__onReset();
    this.__digital__onReset()
};
cycloa.VirtualMachine.prototype.onVBlank = function() {};
cycloa.VirtualMachine.prototype.onIRQ = function() {};
cycloa.VirtualMachine.prototype.read = function(d) {
    var a;
    var c = this.__cpu__rom;
    var b = this.__cpu__ram;
    switch ((d & 57344) >> 13) {
        case 0:
            a = b[d & 2047];
            break;
        case 1:
            a = this.__video__readReg(d);
            break;
        case 2:
            if (d === 16405) {
                a = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                this.IRQ &= 254;
                this.IRQ &= 253
            } else {
                if (d === 16406) {
                    a = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                } else {
                    if (d === 16407) {
                        a = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                    } else {
                        if (d < 16408) {
                            throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + d.toString(16))
                        } else {
                            a = this.readMapperRegisterArea(d)
                        }
                    }
                }
            }
            break;
        case 3:
            a = 0;
            break;
        case 4:
            a = c[(d >> 10) & 31][d & 1023];
            break;
        case 5:
            a = c[(d >> 10) & 31][d & 1023];
            break;
        case 6:
            a = c[(d >> 10) & 31][d & 1023];
            break;
        case 7:
            a = c[(d >> 10) & 31][d & 1023];
            break
    }
    return a
};
cycloa.VirtualMachine.prototype.write = function(g, a) {
    var e = this.__cpu__rom;
    var c = this.__cpu__ram;
    switch ((g & 57344) >> 13) {
        case 0:
            c[g & 8191] = a;
            break;
        case 1:
            this.__video__writeReg(g, a);
            break;
        case 2:
            switch (g & 31) {
                case 0:
                    this.__rectangle0__decayCounter = this.__rectangle0__volumeOrDecayRate = a & 15;
                    this.__rectangle0__decayEnabled = (a & 16) == 0;
                    this.__rectangle0__loopEnabled = (a & 32) == 32;
                    switch (a >> 6) {
                        case 0:
                            this.__rectangle0__dutyRatio = 2;
                            break;
                        case 1:
                            this.__rectangle0__dutyRatio = 4;
                            break;
                        case 2:
                            this.__rectangle0__dutyRatio = 8;
                            break;
                        case 3:
                            this.__rectangle0__dutyRatio = 12;
                            break
                    }
                    break;
                case 1:
                    this.__rectangle0__sweepShiftAmount = a & 7;
                    this.__rectangle0__sweepIncreased = (a & 8) === 0;
                    this.__rectangle0__sweepCounter = this.__rectangle0__sweepUpdateRatio = (a >> 4) & 3;
                    this.__rectangle0__sweepEnabled = (a & 128) === 128;
                    break;
                case 2:
                    this.__rectangle0__frequency = (this.__rectangle0__frequency & 1792) | (a);
                    break;
                case 3:
                    this.__rectangle0__frequency = (this.__rectangle0__frequency & 255) | ((a & 7) << 8);
                    this.__rectangle0__lengthCounter = this.__audio__LengthCounterConst[a >> 3];
                    this.__rectangle0__dutyCounter = 0;
                    this.__rectangle0__decayReloaded = true;
                    break;
                case 4:
                    this.__rectangle1__decayCounter = this.__rectangle1__volumeOrDecayRate = a & 15;
                    this.__rectangle1__decayEnabled = (a & 16) == 0;
                    this.__rectangle1__loopEnabled = (a & 32) == 32;
                    switch (a >> 6) {
                        case 0:
                            this.__rectangle1__dutyRatio = 2;
                            break;
                        case 1:
                            this.__rectangle1__dutyRatio = 4;
                            break;
                        case 2:
                            this.__rectangle1__dutyRatio = 8;
                            break;
                        case 3:
                            this.__rectangle1__dutyRatio = 12;
                            break
                    }
                    break;
                case 5:
                    this.__rectangle1__sweepShiftAmount = a & 7;
                    this.__rectangle1__sweepIncreased = (a & 8) === 0;
                    this.__rectangle1__sweepCounter = this.__rectangle1__sweepUpdateRatio = (a >> 4) & 3;
                    this.__rectangle1__sweepEnabled = (a & 128) === 128;
                    break;
                case 6:
                    this.__rectangle1__frequency = (this.__rectangle1__frequency & 1792) | (a);
                    break;
                case 7:
                    this.__rectangle1__frequency = (this.__rectangle1__frequency & 255) | ((a & 7) << 8);
                    this.__rectangle1__lengthCounter = this.__audio__LengthCounterConst[a >> 3];
                    this.__rectangle1__dutyCounter = 0;
                    this.__rectangle1__decayReloaded = true;
                    break;
                case 8:
                    this.__triangle__enableLinearCounter = ((a & 128) == 128);
                    this.__triangle__linearCounterBuffer = a & 127;
                    break;
                case 9:
                    break;
                case 10:
                    this.__triangle__frequency = (this.__triangle__frequency & 1792) | a;
                    break;
                case 11:
                    this.__triangle__frequency = (this.__triangle__frequency & 255) | ((a & 7) << 8);
                    this.__triangle__lengthCounter = this.__audio__LengthCounterConst[a >> 3];
                    this.__triangle__haltFlag = true;
                    break;
                case 12:
                    this.__noize__decayCounter = this.__noize__volumeOrDecayRate = a & 15;
                    this.__noize__decayEnabled = (a & 16) == 0;
                    this.__noize__loopEnabled = (a & 32) == 32;
                    break;
                case 13:
                    break;
                case 14:
                    this.__noize__modeFlag = (a & 128) == 128;
                    this.__noize__frequency = this.__noize__FrequencyTable[a & 15];
                    break;
                case 15:
                    this.__noize__lengthCounter = this.__audio__LengthCounterConst[a >> 3];
                    this.__noize__decayReloaded = true;
                    break;
                case 16:
                    this.__digital__irqEnabled = (a & 128) == 128;
                    if (!this.__digital__irqEnabled) {
                        this.IRQ &= 253
                    }
                    this.__digital__loopEnabled = (a & 64) == 64;
                    this.__digital__frequency = this.__digital__FrequencyTable[a & 15];
                    break;
                case 17:
                    this.__digital__deltaCounter = a & 127;
                    break;
                case 18:
                    this.__digital__sampleAddr = 49152 | (a << 6);
                    break;
                case 19:
                    this.__digital__sampleLength = this.__digital__sampleLengthBuffer = (a << 4) | 1;
                    break;
                case 20:
                    var h = a << 8;
                    var b = this.__video__spRam;
                    var j = this.__video__spriteAddr;
                    for (var f = 0; f < 256; ++f) {
                        var d = h | f;
                        var k;
                        switch ((d & 57344) >> 13) {
                            case 0:
                                k = c[d & 2047];
                                break;
                            case 1:
                                k = this.__video__readReg(d);
                                break;
                            case 2:
                                if (d === 16405) {
                                    k = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                                    this.IRQ &= 254;
                                    this.IRQ &= 253
                                } else {
                                    if (d === 16406) {
                                        k = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                                    } else {
                                        if (d === 16407) {
                                            k = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                        } else {
                                            if (g < 16408) {
                                                throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + d.toString(16))
                                            } else {
                                                k = this.readMapperRegisterArea(g)
                                            }
                                        }
                                    }
                                }
                                break;
                            case 3:
                                k = 0;
                                break;
                            case 4:
                                k = e[(d >> 10) & 31][d & 1023];
                                break;
                            case 5:
                                k = e[(d >> 10) & 31][d & 1023];
                                break;
                            case 6:
                                k = e[(d >> 10) & 31][d & 1023];
                                break;
                            case 7:
                                k = e[(d >> 10) & 31][d & 1023];
                                break
                        }
                        b[(j + f) & 255] = k
                    }
                    __vm__clockDelta += 512;
                    break;
                case 21:
                    if (!(a & 1)) {
                        this.__rectangle0__lengthCounter = 0
                    }
                    if (!(a & 2)) {
                        this.__rectangle1__lengthCounter = 0
                    }
                    if (!(a & 4)) {
                        this.__triangle__lengthCounter = 0;
                        this.__triangle__linearCounter = this.__triangle__linearCounterBuffer = 0
                    }
                    if (!(a & 8)) {
                        this.__noize__lengthCounter = 0
                    }
                    if (!(a & 16)) {
                        this.__digital__sampleLength = 0
                    } else {
                        if (this.__digital__sampleLength == 0) {
                            this.__digital__sampleLength = this.__digital__sampleLengthBuffer
                        }
                    }
                    break;
                case 22:
                    if ((a & 1) === 1) {
                        this.__pad__pad1Idx = 0;
                        this.__pad__pad2Idx = 0
                    }
                    break;
                case 23:
                    if (a & 128) {
                        this.__audio__isNTSCmode = false;
                        this.__audio__frameCnt = 1786360;
                        this.__audio__frameIRQCnt = 4
                    } else {
                        this.__audio__isNTSCmode = true;
                        this.__audio__frameIRQenabled = true;
                        this.__audio__frameCnt = 1786360;
                        this.__audio__frameIRQCnt = 3
                    } if ((a & 64) === 64) {
                        this.__audio__frameIRQenabled = false;
                        this.IRQ &= 254
                    }
                    break;
                default:
                    break
            }
            break;
        case 3:
            break;
        case 4:
            this.writeMapperCPU(g, a);
            break;
        case 5:
            this.writeMapperCPU(g, a);
            break;
        case 6:
            this.writeMapperCPU(g, a);
            break;
        case 7:
            this.writeMapperCPU(g, a);
            break
    }
};
cycloa.VirtualMachine.prototype.onHardResetCPU = function() {
    this.P = 36;
    this.A = 0;
    this.X = 0;
    this.Y = 0;
    this.SP = 253;
    switch ((16407 & 57344) >> 13) {
        case 0:
            __cpu__ram[16407 & 8191] = 0;
            break;
        case 1:
            this.__video__writeReg(16407, 0);
            break;
        case 2:
            switch (16407 & 31) {
                case 0:
                    this.__rectangle0__decayCounter = this.__rectangle0__volumeOrDecayRate = 0 & 15;
                    this.__rectangle0__decayEnabled = (0 & 16) == 0;
                    this.__rectangle0__loopEnabled = (0 & 32) == 32;
                    switch (0 >> 6) {
                        case 0:
                            this.__rectangle0__dutyRatio = 2;
                            break;
                        case 1:
                            this.__rectangle0__dutyRatio = 4;
                            break;
                        case 2:
                            this.__rectangle0__dutyRatio = 8;
                            break;
                        case 3:
                            this.__rectangle0__dutyRatio = 12;
                            break
                    }
                    break;
                case 1:
                    this.__rectangle0__sweepShiftAmount = 0 & 7;
                    this.__rectangle0__sweepIncreased = (0 & 8) === 0;
                    this.__rectangle0__sweepCounter = this.__rectangle0__sweepUpdateRatio = (0 >> 4) & 3;
                    this.__rectangle0__sweepEnabled = (0 & 128) === 128;
                    break;
                case 2:
                    this.__rectangle0__frequency = (this.__rectangle0__frequency & 1792) | (0);
                    break;
                case 3:
                    this.__rectangle0__frequency = (this.__rectangle0__frequency & 255) | ((0 & 7) << 8);
                    this.__rectangle0__lengthCounter = this.__audio__LengthCounterConst[0 >> 3];
                    this.__rectangle0__dutyCounter = 0;
                    this.__rectangle0__decayReloaded = true;
                    break;
                case 4:
                    this.__rectangle1__decayCounter = this.__rectangle1__volumeOrDecayRate = 0 & 15;
                    this.__rectangle1__decayEnabled = (0 & 16) == 0;
                    this.__rectangle1__loopEnabled = (0 & 32) == 32;
                    switch (0 >> 6) {
                        case 0:
                            this.__rectangle1__dutyRatio = 2;
                            break;
                        case 1:
                            this.__rectangle1__dutyRatio = 4;
                            break;
                        case 2:
                            this.__rectangle1__dutyRatio = 8;
                            break;
                        case 3:
                            this.__rectangle1__dutyRatio = 12;
                            break
                    }
                    break;
                case 5:
                    this.__rectangle1__sweepShiftAmount = 0 & 7;
                    this.__rectangle1__sweepIncreased = (0 & 8) === 0;
                    this.__rectangle1__sweepCounter = this.__rectangle1__sweepUpdateRatio = (0 >> 4) & 3;
                    this.__rectangle1__sweepEnabled = (0 & 128) === 128;
                    break;
                case 6:
                    this.__rectangle1__frequency = (this.__rectangle1__frequency & 1792) | (0);
                    break;
                case 7:
                    this.__rectangle1__frequency = (this.__rectangle1__frequency & 255) | ((0 & 7) << 8);
                    this.__rectangle1__lengthCounter = this.__audio__LengthCounterConst[0 >> 3];
                    this.__rectangle1__dutyCounter = 0;
                    this.__rectangle1__decayReloaded = true;
                    break;
                case 8:
                    this.__triangle__enableLinearCounter = ((0 & 128) == 128);
                    this.__triangle__linearCounterBuffer = 0 & 127;
                    break;
                case 9:
                    break;
                case 10:
                    this.__triangle__frequency = (this.__triangle__frequency & 1792) | 0;
                    break;
                case 11:
                    this.__triangle__frequency = (this.__triangle__frequency & 255) | ((0 & 7) << 8);
                    this.__triangle__lengthCounter = this.__audio__LengthCounterConst[0 >> 3];
                    this.__triangle__haltFlag = true;
                    break;
                case 12:
                    this.__noize__decayCounter = this.__noize__volumeOrDecayRate = 0 & 15;
                    this.__noize__decayEnabled = (0 & 16) == 0;
                    this.__noize__loopEnabled = (0 & 32) == 32;
                    break;
                case 13:
                    break;
                case 14:
                    this.__noize__modeFlag = (0 & 128) == 128;
                    this.__noize__frequency = this.__noize__FrequencyTable[0 & 15];
                    break;
                case 15:
                    this.__noize__lengthCounter = this.__audio__LengthCounterConst[0 >> 3];
                    this.__noize__decayReloaded = true;
                    break;
                case 16:
                    this.__digital__irqEnabled = (0 & 128) == 128;
                    if (!this.__digital__irqEnabled) {
                        this.IRQ &= 253
                    }
                    this.__digital__loopEnabled = (0 & 64) == 64;
                    this.__digital__frequency = this.__digital__FrequencyTable[0 & 15];
                    break;
                case 17:
                    this.__digital__deltaCounter = 0 & 127;
                    break;
                case 18:
                    this.__digital__sampleAddr = 49152 | (0 << 6);
                    break;
                case 19:
                    this.__digital__sampleLength = this.__digital__sampleLengthBuffer = (0 << 4) | 1;
                    break;
                case 20:
                    var d = 0 << 8;
                    var a = this.__video__spRam;
                    var e = this.__video__spriteAddr;
                    for (var c = 0; c < 256; ++c) {
                        var b = d | c;
                        var f;
                        switch ((b & 57344) >> 13) {
                            case 0:
                                f = __cpu__ram[b & 2047];
                                break;
                            case 1:
                                f = this.__video__readReg(b);
                                break;
                            case 2:
                                if (b === 16405) {
                                    f = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                                    this.IRQ &= 254;
                                    this.IRQ &= 253
                                } else {
                                    if (b === 16406) {
                                        f = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                                    } else {
                                        if (b === 16407) {
                                            f = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                        } else {
                                            if (addr < 16408) {
                                                throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + b.toString(16))
                                            } else {
                                                f = this.readMapperRegisterArea(addr)
                                            }
                                        }
                                    }
                                }
                                break;
                            case 3:
                                f = 0;
                                break;
                            case 4:
                                f = __cpu__rom[(b >> 10) & 31][b & 1023];
                                break;
                            case 5:
                                f = __cpu__rom[(b >> 10) & 31][b & 1023];
                                break;
                            case 6:
                                f = __cpu__rom[(b >> 10) & 31][b & 1023];
                                break;
                            case 7:
                                f = __cpu__rom[(b >> 10) & 31][b & 1023];
                                break
                        }
                        a[(e + c) & 255] = f
                    }
                    __vm__clockDelta += 512;
                    break;
                case 21:
                    if (!(0 & 1)) {
                        this.__rectangle0__lengthCounter = 0
                    }
                    if (!(0 & 2)) {
                        this.__rectangle1__lengthCounter = 0
                    }
                    if (!(0 & 4)) {
                        this.__triangle__lengthCounter = 0;
                        this.__triangle__linearCounter = this.__triangle__linearCounterBuffer = 0
                    }
                    if (!(0 & 8)) {
                        this.__noize__lengthCounter = 0
                    }
                    if (!(0 & 16)) {
                        this.__digital__sampleLength = 0
                    } else {
                        if (this.__digital__sampleLength == 0) {
                            this.__digital__sampleLength = this.__digital__sampleLengthBuffer
                        }
                    }
                    break;
                case 22:
                    if ((0 & 1) === 1) {
                        this.__pad__pad1Idx = 0;
                        this.__pad__pad2Idx = 0
                    }
                    break;
                case 23:
                    if (0 & 128) {
                        this.__audio__isNTSCmode = false;
                        this.__audio__frameCnt = 1786360;
                        this.__audio__frameIRQCnt = 4
                    } else {
                        this.__audio__isNTSCmode = true;
                        this.__audio__frameIRQenabled = true;
                        this.__audio__frameCnt = 1786360;
                        this.__audio__frameIRQCnt = 3
                    } if ((0 & 64) === 64) {
                        this.__audio__frameIRQenabled = false;
                        this.IRQ &= 254
                    }
                    break;
                default:
                    break
            }
            break;
        case 3:
            break;
        case 4:
            this.writeMapperCPU(16407, 0);
            break;
        case 5:
            this.writeMapperCPU(16407, 0);
            break;
        case 6:
            this.writeMapperCPU(16407, 0);
            break;
        case 7:
            this.writeMapperCPU(16407, 0);
            break
    }
    switch ((16405 & 57344) >> 13) {
        case 0:
            __cpu__ram[16405 & 8191] = 0;
            break;
        case 1:
            this.__video__writeReg(16405, 0);
            break;
        case 2:
            switch (16405 & 31) {
                case 0:
                    this.__rectangle0__decayCounter = this.__rectangle0__volumeOrDecayRate = 0 & 15;
                    this.__rectangle0__decayEnabled = (0 & 16) == 0;
                    this.__rectangle0__loopEnabled = (0 & 32) == 32;
                    switch (0 >> 6) {
                        case 0:
                            this.__rectangle0__dutyRatio = 2;
                            break;
                        case 1:
                            this.__rectangle0__dutyRatio = 4;
                            break;
                        case 2:
                            this.__rectangle0__dutyRatio = 8;
                            break;
                        case 3:
                            this.__rectangle0__dutyRatio = 12;
                            break
                    }
                    break;
                case 1:
                    this.__rectangle0__sweepShiftAmount = 0 & 7;
                    this.__rectangle0__sweepIncreased = (0 & 8) === 0;
                    this.__rectangle0__sweepCounter = this.__rectangle0__sweepUpdateRatio = (0 >> 4) & 3;
                    this.__rectangle0__sweepEnabled = (0 & 128) === 128;
                    break;
                case 2:
                    this.__rectangle0__frequency = (this.__rectangle0__frequency & 1792) | (0);
                    break;
                case 3:
                    this.__rectangle0__frequency = (this.__rectangle0__frequency & 255) | ((0 & 7) << 8);
                    this.__rectangle0__lengthCounter = this.__audio__LengthCounterConst[0 >> 3];
                    this.__rectangle0__dutyCounter = 0;
                    this.__rectangle0__decayReloaded = true;
                    break;
                case 4:
                    this.__rectangle1__decayCounter = this.__rectangle1__volumeOrDecayRate = 0 & 15;
                    this.__rectangle1__decayEnabled = (0 & 16) == 0;
                    this.__rectangle1__loopEnabled = (0 & 32) == 32;
                    switch (0 >> 6) {
                        case 0:
                            this.__rectangle1__dutyRatio = 2;
                            break;
                        case 1:
                            this.__rectangle1__dutyRatio = 4;
                            break;
                        case 2:
                            this.__rectangle1__dutyRatio = 8;
                            break;
                        case 3:
                            this.__rectangle1__dutyRatio = 12;
                            break
                    }
                    break;
                case 5:
                    this.__rectangle1__sweepShiftAmount = 0 & 7;
                    this.__rectangle1__sweepIncreased = (0 & 8) === 0;
                    this.__rectangle1__sweepCounter = this.__rectangle1__sweepUpdateRatio = (0 >> 4) & 3;
                    this.__rectangle1__sweepEnabled = (0 & 128) === 128;
                    break;
                case 6:
                    this.__rectangle1__frequency = (this.__rectangle1__frequency & 1792) | (0);
                    break;
                case 7:
                    this.__rectangle1__frequency = (this.__rectangle1__frequency & 255) | ((0 & 7) << 8);
                    this.__rectangle1__lengthCounter = this.__audio__LengthCounterConst[0 >> 3];
                    this.__rectangle1__dutyCounter = 0;
                    this.__rectangle1__decayReloaded = true;
                    break;
                case 8:
                    this.__triangle__enableLinearCounter = ((0 & 128) == 128);
                    this.__triangle__linearCounterBuffer = 0 & 127;
                    break;
                case 9:
                    break;
                case 10:
                    this.__triangle__frequency = (this.__triangle__frequency & 1792) | 0;
                    break;
                case 11:
                    this.__triangle__frequency = (this.__triangle__frequency & 255) | ((0 & 7) << 8);
                    this.__triangle__lengthCounter = this.__audio__LengthCounterConst[0 >> 3];
                    this.__triangle__haltFlag = true;
                    break;
                case 12:
                    this.__noize__decayCounter = this.__noize__volumeOrDecayRate = 0 & 15;
                    this.__noize__decayEnabled = (0 & 16) == 0;
                    this.__noize__loopEnabled = (0 & 32) == 32;
                    break;
                case 13:
                    break;
                case 14:
                    this.__noize__modeFlag = (0 & 128) == 128;
                    this.__noize__frequency = this.__noize__FrequencyTable[0 & 15];
                    break;
                case 15:
                    this.__noize__lengthCounter = this.__audio__LengthCounterConst[0 >> 3];
                    this.__noize__decayReloaded = true;
                    break;
                case 16:
                    this.__digital__irqEnabled = (0 & 128) == 128;
                    if (!this.__digital__irqEnabled) {
                        this.IRQ &= 253
                    }
                    this.__digital__loopEnabled = (0 & 64) == 64;
                    this.__digital__frequency = this.__digital__FrequencyTable[0 & 15];
                    break;
                case 17:
                    this.__digital__deltaCounter = 0 & 127;
                    break;
                case 18:
                    this.__digital__sampleAddr = 49152 | (0 << 6);
                    break;
                case 19:
                    this.__digital__sampleLength = this.__digital__sampleLengthBuffer = (0 << 4) | 1;
                    break;
                case 20:
                    var d = 0 << 8;
                    var a = this.__video__spRam;
                    var e = this.__video__spriteAddr;
                    for (var c = 0; c < 256; ++c) {
                        var b = d | c;
                        var f;
                        switch ((b & 57344) >> 13) {
                            case 0:
                                f = __cpu__ram[b & 2047];
                                break;
                            case 1:
                                f = this.__video__readReg(b);
                                break;
                            case 2:
                                if (b === 16405) {
                                    f = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                                    this.IRQ &= 254;
                                    this.IRQ &= 253
                                } else {
                                    if (b === 16406) {
                                        f = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                                    } else {
                                        if (b === 16407) {
                                            f = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                        } else {
                                            if (addr < 16408) {
                                                throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + b.toString(16))
                                            } else {
                                                f = this.readMapperRegisterArea(addr)
                                            }
                                        }
                                    }
                                }
                                break;
                            case 3:
                                f = 0;
                                break;
                            case 4:
                                f = __cpu__rom[(b >> 10) & 31][b & 1023];
                                break;
                            case 5:
                                f = __cpu__rom[(b >> 10) & 31][b & 1023];
                                break;
                            case 6:
                                f = __cpu__rom[(b >> 10) & 31][b & 1023];
                                break;
                            case 7:
                                f = __cpu__rom[(b >> 10) & 31][b & 1023];
                                break
                        }
                        a[(e + c) & 255] = f
                    }
                    __vm__clockDelta += 512;
                    break;
                case 21:
                    if (!(0 & 1)) {
                        this.__rectangle0__lengthCounter = 0
                    }
                    if (!(0 & 2)) {
                        this.__rectangle1__lengthCounter = 0
                    }
                    if (!(0 & 4)) {
                        this.__triangle__lengthCounter = 0;
                        this.__triangle__linearCounter = this.__triangle__linearCounterBuffer = 0
                    }
                    if (!(0 & 8)) {
                        this.__noize__lengthCounter = 0
                    }
                    if (!(0 & 16)) {
                        this.__digital__sampleLength = 0
                    } else {
                        if (this.__digital__sampleLength == 0) {
                            this.__digital__sampleLength = this.__digital__sampleLengthBuffer
                        }
                    }
                    break;
                case 22:
                    if ((0 & 1) === 1) {
                        this.__pad__pad1Idx = 0;
                        this.__pad__pad2Idx = 0
                    }
                    break;
                case 23:
                    if (0 & 128) {
                        this.__audio__isNTSCmode = false;
                        this.__audio__frameCnt = 1786360;
                        this.__audio__frameIRQCnt = 4
                    } else {
                        this.__audio__isNTSCmode = true;
                        this.__audio__frameIRQenabled = true;
                        this.__audio__frameCnt = 1786360;
                        this.__audio__frameIRQCnt = 3
                    } if ((0 & 64) === 64) {
                        this.__audio__frameIRQenabled = false;
                        this.IRQ &= 254
                    }
                    break;
                default:
                    break
            }
            break;
        case 3:
            break;
        case 4:
            this.writeMapperCPU(16405, 0);
            break;
        case 5:
            this.writeMapperCPU(16405, 0);
            break;
        case 6:
            this.writeMapperCPU(16405, 0);
            break;
        case 7:
            this.writeMapperCPU(16405, 0);
            break
    }
    this.PC = (this.__cpu__rom[31][1020] | (this.__cpu__rom[31][1021] << 8))
};
cycloa.VirtualMachine.prototype.onResetCPU = function() {
    this.__vm__reservedClockDelta += 6;
    this.SP -= 3;
    this.P |= 4;
    switch ((16405 & 57344) >> 13) {
        case 0:
            __cpu__ram[16405 & 8191] = 0;
            break;
        case 1:
            this.__video__writeReg(16405, 0);
            break;
        case 2:
            switch (16405 & 31) {
                case 0:
                    this.__rectangle0__decayCounter = this.__rectangle0__volumeOrDecayRate = 0 & 15;
                    this.__rectangle0__decayEnabled = (0 & 16) == 0;
                    this.__rectangle0__loopEnabled = (0 & 32) == 32;
                    switch (0 >> 6) {
                        case 0:
                            this.__rectangle0__dutyRatio = 2;
                            break;
                        case 1:
                            this.__rectangle0__dutyRatio = 4;
                            break;
                        case 2:
                            this.__rectangle0__dutyRatio = 8;
                            break;
                        case 3:
                            this.__rectangle0__dutyRatio = 12;
                            break
                    }
                    break;
                case 1:
                    this.__rectangle0__sweepShiftAmount = 0 & 7;
                    this.__rectangle0__sweepIncreased = (0 & 8) === 0;
                    this.__rectangle0__sweepCounter = this.__rectangle0__sweepUpdateRatio = (0 >> 4) & 3;
                    this.__rectangle0__sweepEnabled = (0 & 128) === 128;
                    break;
                case 2:
                    this.__rectangle0__frequency = (this.__rectangle0__frequency & 1792) | (0);
                    break;
                case 3:
                    this.__rectangle0__frequency = (this.__rectangle0__frequency & 255) | ((0 & 7) << 8);
                    this.__rectangle0__lengthCounter = this.__audio__LengthCounterConst[0 >> 3];
                    this.__rectangle0__dutyCounter = 0;
                    this.__rectangle0__decayReloaded = true;
                    break;
                case 4:
                    this.__rectangle1__decayCounter = this.__rectangle1__volumeOrDecayRate = 0 & 15;
                    this.__rectangle1__decayEnabled = (0 & 16) == 0;
                    this.__rectangle1__loopEnabled = (0 & 32) == 32;
                    switch (0 >> 6) {
                        case 0:
                            this.__rectangle1__dutyRatio = 2;
                            break;
                        case 1:
                            this.__rectangle1__dutyRatio = 4;
                            break;
                        case 2:
                            this.__rectangle1__dutyRatio = 8;
                            break;
                        case 3:
                            this.__rectangle1__dutyRatio = 12;
                            break
                    }
                    break;
                case 5:
                    this.__rectangle1__sweepShiftAmount = 0 & 7;
                    this.__rectangle1__sweepIncreased = (0 & 8) === 0;
                    this.__rectangle1__sweepCounter = this.__rectangle1__sweepUpdateRatio = (0 >> 4) & 3;
                    this.__rectangle1__sweepEnabled = (0 & 128) === 128;
                    break;
                case 6:
                    this.__rectangle1__frequency = (this.__rectangle1__frequency & 1792) | (0);
                    break;
                case 7:
                    this.__rectangle1__frequency = (this.__rectangle1__frequency & 255) | ((0 & 7) << 8);
                    this.__rectangle1__lengthCounter = this.__audio__LengthCounterConst[0 >> 3];
                    this.__rectangle1__dutyCounter = 0;
                    this.__rectangle1__decayReloaded = true;
                    break;
                case 8:
                    this.__triangle__enableLinearCounter = ((0 & 128) == 128);
                    this.__triangle__linearCounterBuffer = 0 & 127;
                    break;
                case 9:
                    break;
                case 10:
                    this.__triangle__frequency = (this.__triangle__frequency & 1792) | 0;
                    break;
                case 11:
                    this.__triangle__frequency = (this.__triangle__frequency & 255) | ((0 & 7) << 8);
                    this.__triangle__lengthCounter = this.__audio__LengthCounterConst[0 >> 3];
                    this.__triangle__haltFlag = true;
                    break;
                case 12:
                    this.__noize__decayCounter = this.__noize__volumeOrDecayRate = 0 & 15;
                    this.__noize__decayEnabled = (0 & 16) == 0;
                    this.__noize__loopEnabled = (0 & 32) == 32;
                    break;
                case 13:
                    break;
                case 14:
                    this.__noize__modeFlag = (0 & 128) == 128;
                    this.__noize__frequency = this.__noize__FrequencyTable[0 & 15];
                    break;
                case 15:
                    this.__noize__lengthCounter = this.__audio__LengthCounterConst[0 >> 3];
                    this.__noize__decayReloaded = true;
                    break;
                case 16:
                    this.__digital__irqEnabled = (0 & 128) == 128;
                    if (!this.__digital__irqEnabled) {
                        this.IRQ &= 253
                    }
                    this.__digital__loopEnabled = (0 & 64) == 64;
                    this.__digital__frequency = this.__digital__FrequencyTable[0 & 15];
                    break;
                case 17:
                    this.__digital__deltaCounter = 0 & 127;
                    break;
                case 18:
                    this.__digital__sampleAddr = 49152 | (0 << 6);
                    break;
                case 19:
                    this.__digital__sampleLength = this.__digital__sampleLengthBuffer = (0 << 4) | 1;
                    break;
                case 20:
                    var d = 0 << 8;
                    var a = this.__video__spRam;
                    var e = this.__video__spriteAddr;
                    for (var c = 0; c < 256; ++c) {
                        var b = d | c;
                        var f;
                        switch ((b & 57344) >> 13) {
                            case 0:
                                f = __cpu__ram[b & 2047];
                                break;
                            case 1:
                                f = this.__video__readReg(b);
                                break;
                            case 2:
                                if (b === 16405) {
                                    f = ((this.__rectangle0__lengthCounter != 0 && this.__rectangle0__frequency >= 8 && this.__rectangle0__frequency < 2048) ? 1 : 0) | ((this.__rectangle1__lengthCounter != 0 && this.__rectangle1__frequency >= 8 && this.__rectangle1__frequency < 2048) ? 2 : 0) | ((this.__triangle__lengthCounter != 0 && this.__triangle__linearCounter != 0) ? 4 : 0) | ((this.__noize__lengthCounter != 0) ? 8 : 0) | ((this.__digital__sampleLength != 0) ? 16 : 0) | (((this.IRQ & 1)) ? 64 : 0) | ((this.IRQ & 2) ? 128 : 0);
                                    this.IRQ &= 254;
                                    this.IRQ &= 253
                                } else {
                                    if (b === 16406) {
                                        f = (this.__pad__pad1Fairy.state >> ((this.__pad__pad1Idx++) & 7)) & 1
                                    } else {
                                        if (b === 16407) {
                                            f = (this.__pad__pad2Fairy.state >> ((this.__pad__pad2Idx++) & 7)) & 1
                                        } else {
                                            if (addr < 16408) {
                                                throw new cycloa.err.CoreException("[FIXME] Invalid addr: 0x" + b.toString(16))
                                            } else {
                                                f = this.readMapperRegisterArea(addr)
                                            }
                                        }
                                    }
                                }
                                break;
                            case 3:
                                f = 0;
                                break;
                            case 4:
                                f = __cpu__rom[(b >> 10) & 31][b & 1023];
                                break;
                            case 5:
                                f = __cpu__rom[(b >> 10) & 31][b & 1023];
                                break;
                            case 6:
                                f = __cpu__rom[(b >> 10) & 31][b & 1023];
                                break;
                            case 7:
                                f = __cpu__rom[(b >> 10) & 31][b & 1023];
                                break
                        }
                        a[(e + c) & 255] = f
                    }
                    __vm__clockDelta += 512;
                    break;
                case 21:
                    if (!(0 & 1)) {
                        this.__rectangle0__lengthCounter = 0
                    }
                    if (!(0 & 2)) {
                        this.__rectangle1__lengthCounter = 0
                    }
                    if (!(0 & 4)) {
                        this.__triangle__lengthCounter = 0;
                        this.__triangle__linearCounter = this.__triangle__linearCounterBuffer = 0
                    }
                    if (!(0 & 8)) {
                        this.__noize__lengthCounter = 0
                    }
                    if (!(0 & 16)) {
                        this.__digital__sampleLength = 0
                    } else {
                        if (this.__digital__sampleLength == 0) {
                            this.__digital__sampleLength = this.__digital__sampleLengthBuffer
                        }
                    }
                    break;
                case 22:
                    if ((0 & 1) === 1) {
                        this.__pad__pad1Idx = 0;
                        this.__pad__pad2Idx = 0
                    }
                    break;
                case 23:
                    if (0 & 128) {
                        this.__audio__isNTSCmode = false;
                        this.__audio__frameCnt = 1786360;
                        this.__audio__frameIRQCnt = 4
                    } else {
                        this.__audio__isNTSCmode = true;
                        this.__audio__frameIRQenabled = true;
                        this.__audio__frameCnt = 1786360;
                        this.__audio__frameIRQCnt = 3
                    } if ((0 & 64) === 64) {
                        this.__audio__frameIRQenabled = false;
                        this.IRQ &= 254
                    }
                    break;
                default:
                    break
            }
            break;
        case 3:
            break;
        case 4:
            this.writeMapperCPU(16405, 0);
            break;
        case 5:
            this.writeMapperCPU(16405, 0);
            break;
        case 6:
            this.writeMapperCPU(16405, 0);
            break;
        case 7:
            this.writeMapperCPU(16405, 0);
            break
    }
    this.PC = (this.__cpu__rom[31][1020] | (this.__cpu__rom[31][1021] << 8))
};
cycloa.VirtualMachine.ZNFlagCache = new Uint8Array([2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128]);
cycloa.VirtualMachine.TransTable = new Uint32Array([459499, 393688, 255, 255, 255, 197073, 327905, 255, 197195, 131536, 131323, 255, 255, 262612, 393444, 255, 131994, 328153, 255, 255, 255, 262610, 393442, 255, 131707, 262614, 255, 255, 255, 262613, 393445, 255, 394036, 393432, 255, 255, 196865, 196817, 328161, 255, 262763, 131280, 131579, 255, 262404, 262356, 393700, 255, 131962, 327897, 255, 255, 255, 262354, 393698, 255, 131771, 262358, 255, 255, 255, 262357, 393701, 255, 394011, 393592, 255, 255, 255, 196977, 328113, 255, 197179, 131440, 131531, 255, 197412, 262516, 393652, 255, 132010, 328057, 255, 255, 255, 262514, 393650, 255, 131739, 262518, 255, 255, 255, 262517, 393653, 255, 393995, 393416, 255, 255, 255, 196801, 328193, 255, 262747, 131264, 131611, 255, 328487, 262340, 393732, 255, 132026, 327881, 255, 255, 255, 262338, 393730, 255, 131803, 262342, 255, 255, 255, 262341, 393733, 255, 255, 393272, 255, 255, 196689, 196657, 196673, 255, 131435, 255, 131227, 255, 262228, 262196, 262212, 255, 131914, 327737, 255, 255, 262226, 262194, 262211, 255, 131259, 262198, 131243, 255, 255, 262197, 255, 255, 131104, 393224, 131088, 255, 196641, 196609, 196625, 255, 131195, 131072, 131179, 255, 262180, 262148, 262164, 255, 131930, 327689, 255, 255, 262178, 262146, 262163, 255, 131755, 262150, 131211, 255, 262181, 262149, 262166, 255, 131376, 393496, 255, 255, 196913, 196881, 328001, 255, 131499, 131344, 131419, 255, 262452, 262420, 393540, 255, 131978, 327961, 255, 255, 255, 262418, 393538, 255, 131723, 262422, 255, 255, 255, 262421, 393541, 255, 131360, 393768, 255, 255, 196897, 197153, 328065, 255, 131483, 131616, 131835, 255, 262436, 262692, 393604, 255, 131946, 328233, 255, 255, 255, 262690, 393602, 255, 131787, 262694, 255, 255, 255, 262693, 393605, 255]);
cycloa.VirtualMachine.prototype.__video__onHardReset = function() {
    for (var c = 0; c < 4; ++c) {
        var b = this.__video__internalVram[c];
        for (var a = 0; a < 1024; ++a) {
            b[a] = 0
        }
    }
    for (var c = 0; c < 256; ++c) {
        this.__video__spRam[c] = 0
    }
    for (var c = 0; c < 36; ++c) {
        this.__video__palette[c] = 0
    }
    this.__video__nowY = 0;
    this.__video__nowX = 0;
    this.__video__executeNMIonVBlank = false;
    this.__video__spriteHeight = 8;
    this.__video__patternTableAddressBackground = 0;
    this.__video__patternTableAddress8x8Sprites = 0;
    this.__video__vramIncrementSize = 1;
    this.__video__vramAddrReloadRegister = 0;
    this.__video__horizontalScrollBits = 0;
    this.__video__colorEmphasis = 0;
    this.__video__spriteVisibility = false;
    this.__video__backgroundVisibility = false;
    this.__video__spriteClipping = true;
    this.__video__backgroundClipping = true;
    this.__video__paletteMask = 63;
    this.__video__spriteAddr = 0;
    this.__video__vramAddrRegisterWritten = false;
    this.__video__scrollRegisterWritten = false;
    this.__video__vramAddrRegister = 0
};
cycloa.VirtualMachine.prototype.__video__onReset = function() {
    this.__video__executeNMIonVBlank = false;
    this.__video__spriteHeight = 8;
    this.__video__patternTableAddressBackground = 0;
    this.__video__patternTableAddress8x8Sprites = 0;
    this.__video__vramIncrementSize = 1;
    this.__video__vramAddrReloadRegister = 0;
    this.__video__horizontalScrollBits = 0;
    this.__video__colorEmphasis = 0;
    this.__video__spriteVisibility = false;
    this.__video__backgroundVisibility = false;
    this.__video__spriteClipping = true;
    this.__video__backgroundClipping = true;
    this.__video__paletteMask = 63;
    this.__video__vramAddrRegisterWritten = false;
    this.__video__scrollRegisterWritten = false;
    this.__video__vramBuffer = 0
};
cycloa.VirtualMachine.prototype.__video__spriteEval = function() {
    var d = this.__video__spRam;
    var l = this.__video__nowY - 1;
    var m = 0;
    this.__video__lostSprites = false;
    var n = this.__video__spriteHeight;
    var h = n === 16;
    var c = this.__video__spriteTable;
    var b = this.__video__patternTableAddress8x8Sprites;
    for (var g = 0; g < 256; g += 4) {
        var e = d[g] + 1;
        var k = e + n;
        var a = false;
        if (e <= l && l < k) {
            if (m < 8) {
                a = true;
                var o = c[m];
                o.idx = g >> 2;
                o.y = e;
                o.x = d[g + 3];
                if (h) {
                    var f = d[g + 1];
                    o.tileAddr = (f & 1) << 12 | (f & 254) << 4
                } else {
                    o.tileAddr = (d[g + 1] << 4) | b
                }
                var j = d[g + 2];
                o.paletteNo = 4 | (j & 3);
                o.isForeground = (j & (1 << 5)) === 0;
                o.flipHorizontal = (j & (1 << 6)) !== 0;
                o.flipVertical = (j & (1 << 7)) !== 0;
                m++
            } else {
                this.__video__lostSprites = true;
                break
            }
        }
    }
    this.__video__spriteHitCnt = m;
    for (var g = m; g < 8; g++) {
        c[g].y = 255
    }
};
cycloa.VirtualMachine.prototype.__video__buildBgLine = function() {
    var y = this.__video__palette;
    var l = this.__video__vramMirroring;
    var w = this.__video__pattern;
    var o = this.__video__screenBuffer8;
    var d = this.__video__screenBuffer32;
    var g = 0 | y[32];
    if (!this.__video__backgroundVisibility) {
        var m = g << 24 | g << 16 | g << 8 | g;
        for (var q = ((nowY - 1) << 6), p = q + 64; q < p; ++q) {
            screenBuffer32[q] = m
        }
        return
    }
    var A = (this.__video__nowY - 1) << 8;
    var e = 8192 | (this.__video__vramAddrRegister & 4095);
    var r = (this.__video__vramAddrRegister >> 12);
    var s = this.__video__horizontalScrollBits;
    var k = this.__video__patternTableAddressBackground;
    var b = 0;
    while (true) {
        var f = (((e & 16128) !== 16128) ? (e < 8192 ? w[(e >> 9) & 15][e & 511] : l[(e >> 10) & 3][e & 1023]) : ((e & 3 === 0) ? y[32 | ((addr >> 2) & 3)] : y[e & 31]));
        var u = (e & 992) >> 5;
        var t = ((e & 12032) | 960 | ((u & 28) << 1) | ((e >> 2) & 7));
        var j = ((((t & 16128) !== 16128) ? (t < 8192 ? w[(t >> 9) & 15][t & 511] : l[(t >> 10) & 3][t & 1023]) : ((t & 3 === 0) ? y[32 | ((addr >> 2) & 3)] : y[t & 31])) >> (((u & 2) << 1) | (e & 2))) & 3;
        var B = k | (f << 4) | r;
        var z = (((B & 16128) !== 16128) ? (B < 8192 ? w[(B >> 9) & 15][B & 511] : l[(B >> 10) & 3][B & 1023]) : ((B & 3 === 0) ? y[32 | ((addr >> 2) & 3)] : y[B & 31]));
        var c = B + 8;
        var v = (((c & 16128) !== 16128) ? (c < 8192 ? w[(c >> 9) & 15][c & 511] : l[(c >> 10) & 3][c & 1023]) : ((c & 3 === 0) ? y[32 | ((addr >> 2) & 3)] : y[c & 31]));
        var a = j << 2;
        for (var h = s; h < 8; h++) {
            var n = ((z >> (7 - h)) & 1) | (((v >> (7 - h)) & 1) << 1);
            if (n !== 0) {
                o[A + b] = y[a + n] | 128
            } else {
                o[A + b] = g
            }
            b++;
            if (b >= 256) {
                return
            }
        }
        if ((e & 31) === 31) {
            e &= 65504;
            e ^= 1024
        } else {
            e++
        }
        s = 0
    }
};
cycloa.VirtualMachine.prototype.__video__buildSpriteLine = function() {
    if (!this.__video__spriteVisibility) {
        return
    }
    var v = this.__video__palette;
    var l = this.__video__vramMirroring;
    var u = this.__video__pattern;
    var p = this.__video__screenBuffer8;
    var c = this.__video__screenBuffer32;
    var h = this.__video__nowY - 1;
    var n = this.__video__spriteHeight;
    var f = !this.__video__sprite0Hit;
    var t = this.__video__spriteHitCnt;
    var A = (this.__video__nowY - 1) << 8;
    for (var r = 0; r < t; r++) {
        var e = this.__video__spriteTable[r];
        f &= (e.idx === 0);
        var s = 0;
        if (e.flipVertical) {
            s = n + e.y - h - 1
        } else {
            s = h - e.y
        }
        var B = e.tileAddr | ((s & 8) << 1) | (s & 7);
        var z = (((B & 16128) !== 16128) ? (B < 8192 ? u[(B >> 9) & 15][B & 511] : l[(B >> 10) & 3][B & 1023]) : ((B & 3 === 0) ? v[32 | ((addr >> 2) & 3)] : v[B & 31]));
        var d = B + 8;
        var w = (((d & 16128) !== 16128) ? (d < 8192 ? u[(d >> 9) & 15][d & 511] : l[(d >> 10) & 3][d & 1023]) : ((d & 3 === 0) ? v[32 | ((addr >> 2) & 3)] : v[d & 31]));
        var a = 256 - e.x;
        var b = a < 8 ? a : 8;
        var q = e.isForeground ? 192 : 64;
        if (e.flipHorizontal) {
            for (var j = 0; j < b; j++) {
                var o = ((z >> j) & 1) | (((w >> j) & 1) << 1);
                var C = p[A + e.x + j];
                var k = (C & 192) === 0;
                var m = (C & 192) === 128;
                var g = (C & 64) === 0;
                if (f && (o !== 0 && m)) {
                    this.__video__sprite0Hit = true;
                    f = false
                }
                if (o != 0 && ((!e.isForeground && k) || (e.isForeground && g))) {
                    p[A + e.x + j] = v[(e.paletteNo << 2) + o] | q
                }
            }
        } else {
            for (var j = 0; j < b; j++) {
                var o = ((z >> (7 - j)) & 1) | (((w >> (7 - j)) & 1) << 1);
                var C = p[A + e.x + j];
                var k = (C & 192) === 0;
                var m = (C & 192) === 128;
                var g = (C & 64) === 0;
                if (f && (o !== 0 && m)) {
                    this.__video__sprite0Hit = true;
                    f = false
                }
                if (o != 0 && ((!e.isForeground && k) || (e.isForeground && g))) {
                    p[A + e.x + j] = v[(e.paletteNo << 2) + o] | q
                }
            }
        }
    }
};
cycloa.VirtualMachine.prototype.__video__writeReg = function(g, f) {
    var e = this.__video__palette;
    var d = this.__video__vramMirroring;
    var a = this.__video__pattern;
    var b = this.__video__screenBuffer8;
    var c = this.__video__screenBuffer32;
    switch (g & 7) {
        case 0:
            this.__video__executeNMIonVBlank = ((f & 128) === 128) ? true : false;
            this.__video__spriteHeight = ((f & 32) === 32) ? 16 : 8;
            this.__video__patternTableAddressBackground = (f & 16) << 8;
            this.__video__patternTableAddress8x8Sprites = (f & 8) << 9;
            this.__video__vramIncrementSize = ((f & 4) === 4) ? 32 : 1;
            this.__video__vramAddrReloadRegister = (this.__video__vramAddrReloadRegister & 29695) | ((f & 3) << 10);
            break;
        case 1:
            this.__video__colorEmphasis = f >> 5;
            this.__video__spriteVisibility = ((f & 16) === 16) ? true : false;
            this.__video__backgroundVisibility = ((f & 8) == 8) ? true : false;
            this.__video__spriteClipping = ((f & 4) === 4) ? false : true;
            this.__video__backgroundClipping = ((f & 2) === 2) ? false : true;
            this.__video__paletteMask = ((f & 1) === 1) ? 48 : 63;
            break;
        case 3:
            this.__video__spriteAddr = f;
            break;
        case 4:
            spRam[this.__video__spriteAddr] = f;
            this.__video__spriteAddr = (this.__video__spriteAddr + 1) & 255;
            break;
        case 5:
            if (this.__video__scrollRegisterWritten) {
                this.__video__vramAddrReloadRegister = (this.__video__vramAddrReloadRegister & 35871) | ((f & 248) << 2) | ((f & 7) << 12)
            } else {
                this.__video__vramAddrReloadRegister = (this.__video__vramAddrReloadRegister & 65504) | f >> 3;
                this.__video__horizontalScrollBits = f & 7
            }
            this.__video__scrollRegisterWritten = !this.__video__scrollRegisterWritten;
            break;
        case 6:
            if (this.__video__vramAddrRegisterWritten) {
                this.__video__vramAddrReloadRegister = (this.__video__vramAddrReloadRegister & 32512) | f;
                this.__video__vramAddrRegister = this.__video__vramAddrReloadRegister & 16383
            } else {
                this.__video__vramAddrReloadRegister = (this.__video__vramAddrReloadRegister & 255) | ((f & 127) << 8)
            }
            this.__video__vramAddrRegisterWritten = !this.__video__vramAddrRegisterWritten;
            break;
        case 7:
            this.__video__writeVram(this.__video__vramAddrRegister, f);
            this.__video__vramAddrRegister = (this.__video__vramAddrRegister + this.__video__vramIncrementSize) & 16383;
            break;
        default:
            throw new cycloa.err.CoreException("Invalid addr: 0x" + g.toString(16))
    }
};
cycloa.VirtualMachine.prototype.__video__readReg = function(h) {
    var a = this.__video__palette;
    var d = this.__video__vramMirroring;
    var e = this.__video__pattern;
    var b = this.__video__screenBuffer8;
    var c = this.__video__screenBuffer32;
    switch (h & 7) {
        case 2:
            this.__video__vramAddrRegisterWritten = false;
            this.__video__scrollRegisterWritten = false;
            var i = ((this.__video__nowOnVBnank) ? 128 : 0) | ((this.__video__sprite0Hit) ? 64 : 0) | ((this.__video__lostSprites) ? 32 : 0);
            this.__video__nowOnVBnank = false;
            return i;
        case 4:
            return this.__video__spRam[this.__video__spriteAddr];
        case 7:
            var f = this.__video__vramAddrRegister;
            if ((f & 16128) !== 16128) {
                var g = this.__video__vramBuffer;
                this.__video__vramBuffer = (f < 8192 ? e[(f >> 9) & 15][f & 511] : d[(f >> 10) & 3][f & 1023]);
                this.__video__vramAddrRegister = (f + this.__video__vramIncrementSize) & 16383;
                return g
            } else {
                var g = ((f & 3 === 0) ? a[32 | ((h >> 2) & 3)] : a[f & 31]);
                this.__video__vramBuffer = (f < 8192 ? e[(f >> 9) & 15][f & 511] : d[(f >> 10) & 3][f & 1023]);
                this.__video__vramAddrRegister = (f + this.__video__vramIncrementSize) & 16383;
                return g
            }
        default:
            return 0
    }
};
cycloa.VirtualMachine.prototype.__video__writeVramExternal = function(b, a) {
    if (b < 8192) {} else {
        this.__video__vramMirroring[(b >> 10) & 3][b & 1023] = a
    }
};
cycloa.VirtualMachine.prototype.__video__writeVram = function(b, a) {
    if ((b & 16128) !== 16128) {
        this.__video__writeVramExternal(b, a)
    } else {
        if ((b & 3) === 0) {
            this.__video__palette[32 | ((b >> 2) & 3)] = a & 63
        } else {
            this.__video__palette[b & 31] = a & 63
        }
    }
};
cycloa.VirtualMachine.prototype.__video__changeMirrorType = function(a) {
    this.__video__mirrorType = a;
    switch (a) {
        case 3:
            this.__video__vramMirroring[0] = this.__video__internalVram[0];
            this.__video__vramMirroring[1] = this.__video__internalVram[0];
            this.__video__vramMirroring[2] = this.__video__internalVram[0];
            this.__video__vramMirroring[3] = this.__video__internalVram[0];
            break;
        case 4:
            this.__video__vramMirroring[0] = this.__video__internalVram[1];
            this.__video__vramMirroring[1] = this.__video__internalVram[1];
            this.__video__vramMirroring[2] = this.__video__internalVram[1];
            this.__video__vramMirroring[3] = this.__video__internalVram[1];
            break;
        case 0:
            this.__video__vramMirroring[0] = this.__video__internalVram[1];
            this.__video__vramMirroring[1] = this.__video__internalVram[2];
            this.__video__vramMirroring[2] = this.__video__internalVram[3];
            this.__video__vramMirroring[3] = this.__video__internalVram[4];
            break;
        case 2:
            this.__video__vramMirroring[0] = this.__video__internalVram[0];
            this.__video__vramMirroring[1] = this.__video__internalVram[0];
            this.__video__vramMirroring[2] = this.__video__internalVram[1];
            this.__video__vramMirroring[3] = this.__video__internalVram[1];
            break;
        case 1:
            this.__video__vramMirroring[0] = this.__video__internalVram[0];
            this.__video__vramMirroring[1] = this.__video__internalVram[1];
            this.__video__vramMirroring[2] = this.__video__internalVram[0];
            this.__video__vramMirroring[3] = this.__video__internalVram[1];
            break;
        default:
            throw new cycloa.err.CoreException("Invalid mirroring type!")
    }
};
cycloa.VirtualMachine.prototype.__audio__onHardReset = function() {
    this.__audio__clockCnt = 0;
    this.__audio__leftClock = 0;
    this.__audio__frameIRQenabled = true;
    this.IRQ &= 254;
    this.__audio__isNTSCmode = true;
    this.__audio__frameIRQCnt = 0;
    this.__audio__frameCnt = 0
};
cycloa.VirtualMachine.prototype.__audio__onReset = function() {};
cycloa.VirtualMachine.LengthCounterConst = [10, 254, 20, 2, 40, 4, 80, 6, 160, 8, 60, 10, 14, 12, 26, 14, 12, 16, 24, 18, 48, 20, 96, 22, 192, 24, 72, 26, 16, 28, 32, 30];
cycloa.VirtualMachine.prototype.__rectangle1__onHardReset = function() {
    this.__rectangle1__volumeOrDecayRate = 0;
    this.__rectangle1__decayReloaded = false;
    this.__rectangle1__decayEnabled = false;
    this.__rectangle1__decayVolume = 0;
    this.__rectangle1__dutyRatio = 0;
    this.__rectangle1__freqCounter = 0;
    this.__rectangle1__dutyCounter = 0;
    this.__rectangle1__decayCounter = 0;
    this.__rectangle1__sweepEnabled = 0;
    this.__rectangle1__sweepShiftAmount = 0;
    this.__rectangle1__sweepIncreased = false;
    this.__rectangle1__sweepUpdateRatio = 0;
    this.__rectangle1__sweepCounter = 0;
    this.__rectangle1__frequency = 0;
    this.__rectangle1__loopEnabled = false;
    this.__rectangle1__lengthCounter = 0
};
cycloa.VirtualMachine.prototype.__rectangle1__onReset = function() {
    this.__rectangle1__onHardReset()
};
cycloa.VirtualMachine.prototype.__rectangle0__onHardReset = function() {
    this.__rectangle0__volumeOrDecayRate = 0;
    this.__rectangle0__decayReloaded = false;
    this.__rectangle0__decayEnabled = false;
    this.__rectangle0__decayVolume = 0;
    this.__rectangle0__dutyRatio = 0;
    this.__rectangle0__freqCounter = 0;
    this.__rectangle0__dutyCounter = 0;
    this.__rectangle0__decayCounter = 0;
    this.__rectangle0__sweepEnabled = 0;
    this.__rectangle0__sweepShiftAmount = 0;
    this.__rectangle0__sweepIncreased = false;
    this.__rectangle0__sweepUpdateRatio = 0;
    this.__rectangle0__sweepCounter = 0;
    this.__rectangle0__frequency = 0;
    this.__rectangle0__loopEnabled = false;
    this.__rectangle0__lengthCounter = 0
};
cycloa.VirtualMachine.prototype.__rectangle0__onReset = function() {
    this.__rectangle0__onHardReset()
};
cycloa.VirtualMachine.prototype.__triangle__onHardReset = function() {
    this.__triangle__haltFlag = false;
    this.__triangle__enableLinearCounter = false;
    this.__triangle__frequency = 0;
    this.__triangle__linearCounterBuffer = 0;
    this.__triangle__linearCounter = 0;
    this.__triangle__lengthCounter = 0;
    this.__triangle__freqCounter = 0;
    this.__triangle__streamCounter = 0
};
cycloa.VirtualMachine.prototype.__triangle__onReset = function() {
    this.__triangle__onHardReset()
};
cycloa.VirtualMachine.prototype.__noize__onHardReset = function() {
    this.__noize__shiftRegister = 1 << 14;
    this.__noize__modeFlag = false;
    this.__noize__volumeOrDecayRate = false;
    this.__noize__decayReloaded = false;
    this.__noize__decayEnabled = false;
    this.__noize__decayCounter = 0;
    this.__noize__decayVolume = 0;
    this.__noize__loopEnabled = false;
    this.__noize__frequency = 0;
    this.__noize__lengthCounter = 0;
    this.__noize__freqCounter = 0
};
cycloa.VirtualMachine.prototype.__noize__onReset = function() {
    this.__noize__onHardReset()
};
cycloa.VirtualMachine.prototype.__digital__isIRQEnabled = function() {
    return this.__digital__irqEnabled
};
cycloa.VirtualMachine.prototype.__digital__onHardReset = function() {
    this.__digital__irqEnabled = false;
    this.IRQ &= 253;
    this.__digital__loopEnabled = false;
    this.__digital__frequency = 0;
    this.__digital__deltaCounter = 0;
    this.__digital__sampleAddr = 49152;
    this.__digital__sampleLength = 0;
    this.__digital__sampleLengthBuffer = 0;
    this.__digital__sampleBuffer = 0;
    this.__digital__sampleBufferLeft = 0;
    this.__digital__freqCounter = 0
};
cycloa.VirtualMachine.prototype.__digital__onReset = function() {
    this.__digital__onHardReset()
};
cycloa.VirtualMachine.Mapper = [];
cycloa.VirtualMachine.Mapper[0] = function(c) {
    c.__mapper__writeMapperCPU = function(e) {};
    var b = 0;
    for (var d = 0; d < 32; ++d) {
        c.__cpu__rom[d] = c.__mapper__prgRom.subarray(b, b += 1024);
        if (b >= c.__mapper__prgRom.length) {
            b = 0
        }
    }
    var a = 0;
    for (var d = 0; d < 16; ++d) {
        c.__video__pattern[d] = c.__mapper__chrRom.subarray(a, a += 512)
    }
};
cycloa.VirtualMachine.prototype.load = function(b) {
    this.__mapper__parseROM(b);
    var a = cycloa.VirtualMachine.Mapper[this.__mapper__mapperNo];
    if (!a) {
        throw new cycloa.err.NotSupportedException("Not supported mapper: " + this.__mapper__mapperNo)
    }
    a(this);
    this.__video__changeMirrorType(this.__mapper__mirrorType)
};
cycloa.VirtualMachine.prototype.__mapper__parseROM = function(c) {
    var b = new Uint8Array(c);
    if (!(b[0] === 78 && b[1] === 69 && b[2] === 83 && b[3] == 26)) {
        throw new cycloa.err.CoreException("[FIXME] Invalid header!!")
    }
    this.__mapper__prgSize = 16384 * b[4];
    this.__mapper__chrSize = 8192 * b[5];
    this.__mapper__prgPageCnt = b[4];
    this.__mapper__chrPageCnt = b[5];
    this.__mapper__mapperNo = ((b[6] & 240) >> 4) | (b[7] & 240);
    this.__mapper__trainerFlag = (b[6] & 4) === 4;
    this.__mapper__sramFlag = (b[6] & 2) === 2;
    if ((b[6] & 8) == 8) {
        this.__mapper__mirrorType = 0
    } else {
        this.__mapper__mirrorType = (b[6] & 1) == 1 ? 1 : 2
    }
    var a = 16;
    if (this.__mapper__trainerFlag) {
        if (a + 512 > c.byteLength) {
            throw new cycloa.err.CoreException("[FIXME] Invalid file size; too short!")
        }
        this.__mapper__trainer = new Uint8Array(c, a, 512);
        a += 512
    }
    if (a + this.__mapper__prgSize > c.byteLength) {
        throw new cycloa.err.CoreException("[FIXME] Invalid file size; too short!")
    }
    this.__mapper__prgRom = new Uint8Array(c, a, this.__mapper__prgSize);
    a += this.__mapper__prgSize;
    if (a + this.__mapper__chrSize > c.byteLength) {
        throw new cycloa.err.CoreException("[FIXME] Invalid file size; too short!")
    } else {
        if (a + this.__mapper__chrSize < c.byteLength) {
            throw cycloa.err.CoreException("[FIXME] Invalid file size; too long!")
        }
    }
    this.__mapper__chrRom = new Uint8Array(c, a, this.__mapper__chrSize)
};

function VideoFairy(a) {
    this.ctx_ = a;
    this.palette_ = cycloa.NesPalette;
    this.prevBuffer_ = new Uint8ClampedArray(256 * 240);
    a.fillStyle = "#FFFFFF";
    a.fillRect(0, 0, 256, 240);
    this.image_ = this.ctx_.getImageData(0, 0, 256, 240);
}
VideoFairy.prototype.__proto__ = cycloa.AbstractVideoFairy.prototype;
VideoFairy.prototype.dispatchRendering = function(c, e) {
    var j = this.image_.data;
    var b = this.palette_;
    var g = this.prevBuffer_;
    var a;
    for (var f = 0; f < 61440; ++f) {
        a = c[f] & e;
        if (a != g[f]) {
            var h = f << 2,
                d = b[a];
            j[h] = (d >> 16) & 255;
            j[h + 1] = (d >> 8) & 255;
            j[h + 2] = d & 255;
            g[f] = a
        }
    }
    this.ctx_.putImageData(this.image_, 0, 0)
};
VideoFairy.prototype.recycle = function() {
    this.ctx_.fillStyle = "#000000";
    this.ctx_.fillRect(0, 0, 256, 240);
    var a = this.prevBuffer_;
    for (var b = 0; b < 240 * 256; ++b) {
        a[b] = 255
    }
};

function AudioFairy() {
    this.SAMPLE_RATE_ = 22050;
    this.dataLength = (this.SAMPLE_RATE_ / 4) | 0;
    this.enabled = false;
    var a = window.AudioContext;
    if (a) {
        this.enabled = true;
        this.context_ = new a();
        this.dataIndex = 0;
        this.initBuffer = function() {
            this.buffer_ = this.context_.createBuffer(1, this.dataLength, this.SAMPLE_RATE_);
            this.data = this.buffer_.getChannelData(0)
        };
        this.onDataFilled = function() {
            var b = this.context_.createBufferSource();
            b.loop = false;
            b.connect(this.context_.destination);
            b.buffer = this.buffer_;
            b.start(0);
            this.initBuffer();
            this.dataIndex = 0
        };
        this.initBuffer()
    } else {
        log.info("Audio is not available")
    }
}
AudioFairy.prototype.__proto__ = cycloa.AbstractAudioFairy.prototype;
AudioFairy.prototype.recycle = function() {
    this.dataIndex = 0
};

function PadFairy() {
    this.state = 0;
    var b = this;
}
PadFairy.prototype.__proto__ = cycloa.AbstractPadFairy.prototype;
PadFairy.prototype.recycle = function() {
    this.state = 0
};
window.requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(a) {
        window.setTimeout(a, second)
    }
})();

function NesController(a) {
    this.videoFairy_ = new VideoFairy(a);
    this.audioFairy_ = new AudioFairy();
    this.padFairy_ = new PadFairy();
    this.machine_ = new cycloa.VirtualMachine(this.videoFairy_, this.audioFairy_, this.padFairy_);
    this.running_ = false;
    this.loaded_ = false
}
NesController.prototype.load = function(a) {
    this.machine_.load(a);
    if (!this.loaded_) {
        this.machine_.onHardReset()
    } else {
        this.machine_.onReset()
    }
    this.loaded_ = true;
    if (!this.running_) {
        this.start()
    }
    return true
};
NesController.prototype.start = function() {
    if (this.running_) {
        return false
    }
    if (!this.loaded_) {
        return false
    }
    this.running_ = true;
    var b = this;
    var a = function() {
        if (b.running_) {
            window.requestAnimFrame(a);
        }
        b.machine_.run()
    };
    a();
    return true
};
NesController.prototype.stop = function() {
    if (!this.loaded_) {
        return false
    }
    this.running_ = false;
    return true
};
NesController.prototype.hardReset = function() {
    if (!this.loaded_) {
        return false
    }
    this.machine_.onHardReset();
    return true
};
NesController.prototype.reset = function() {
    if (!this.loaded_) {
        return false
    }
    this.machine_.onReset();
    return true
};
NesController.prototype.keyDownUP = function() {
    this.padFairy_.state |= this.padFairy_.MASK_UP
};
NesController.prototype.keyUpUP = function() {
    this.padFairy_.state &= ~this.padFairy_.MASK_UP
};
NesController.prototype.keyDownDOWN = function() {
    this.padFairy_.state |= this.padFairy_.MASK_DOWN
};
NesController.prototype.keyUpDOWN = function() {
    this.padFairy_.state &= ~this.padFairy_.MASK_DOWN
};
NesController.prototype.keyDownLEFT = function() {
    this.padFairy_.state |= this.padFairy_.MASK_LEFT
};
NesController.prototype.keyUpLEFT = function() {
    this.padFairy_.state &= ~this.padFairy_.MASK_LEFT
};
NesController.prototype.keyDownRIGHT = function() {
    this.padFairy_.state |= this.padFairy_.MASK_RIGHT
};
NesController.prototype.keyUpRIGHT = function() {
    this.padFairy_.state &= ~this.padFairy_.MASK_RIGHT
};
NesController.prototype.keyDownA = function() {
    this.padFairy_.state |= this.padFairy_.MASK_A
};
NesController.prototype.keyUpA = function() {
    this.padFairy_.state &= ~this.padFairy_.MASK_A
};
NesController.prototype.keyDownB = function() {
    this.padFairy_.state |= this.padFairy_.MASK_B
};
NesController.prototype.keyUpB = function() {
    this.padFairy_.state &= ~this.padFairy_.MASK_B
};
NesController.prototype.keyDownSELECT = function() {
    this.padFairy_.state |= this.padFairy_.MASK_SELECT
};
NesController.prototype.keyUpSELECT = function() {
    this.padFairy_.state &= ~this.padFairy_.MASK_SELECT
};
NesController.prototype.keyDownSTART = function() {
    this.padFairy_.state |= this.padFairy_.MASK_START
};
NesController.prototype.keyUpSTART = function() {
    this.padFairy_.state &= ~this.padFairy_.MASK_START
};