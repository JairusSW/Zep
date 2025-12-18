// AUTO GENERATED FILE. DO NOT EDIT.

import { DiagnosticDef } from "./diagnostics";

export enum DiagnosticKind {
	SyntaxError,
	CompileTimeError,
	InternalError,
	ConfigurationError
}

export enum DiagnosticCode {
	UNEXPECTED_TOKEN = 1,
	EXPECTED_TOKEN = 2,
	UNTERMINATED_STRING_LITERAL = 3,
	UNTERMINATED_BLOCK_COMMENT = 4,
	UNKNOWN_IDENTIFIER = 5,
	TYPE_MISMATCH = 6,
	NAMESPACE_CANNOT_BE_USED_HERE = 7,
	INVALID_COMPILER_OPTION = 8,
	INTERNAL_COMPILER_ERROR = 9,
	EXPECTED_TYPE_AFTER_COLON = 10,
	EXPECTED_EQUALS_OR_COLON_AFTER_VARIABLE_NAME = 11,
	EXPECTED_TYPE_AFTER_BAR_IN_UNION = 12,
	EXPECTED_NAME_AFTER_FUNCTION = 13,
	EXPECTED_NAME_AFTER_ENUM = 14,
	EXPECTED_VALUE_AFTER_EQUALS = 15,
	EXPECTED_TAG_IN_MODIFIER = 16,
	MISSING_TOKEN = 17,
	UNSUPPORTED = 18,
	MISSING_LITERAL = 19,
	UNTERMINATED_GROUP = 20,
	EXPECTED_EXPRESSION_AFTER_RETURN = 21,
	EXPECTED_NAME_AFTER_STRUCT = 22,
	EXPECTED_EXPRESSION_AFTER_OPERATOR = 23,
	EXPECTED_PARAMETER_LIST = 24,
	MISSING_TOKEN_AT = 25
}

export const DIAGNOSTICS: Record<DiagnosticCode, DiagnosticDef> = {
	[DiagnosticCode.UNEXPECTED_TOKEN]: { code: 1, kind: DiagnosticKind.SyntaxError, message: "Unexpected token \'{found}\'." },
	[DiagnosticCode.EXPECTED_TOKEN]: { code: 2, kind: DiagnosticKind.SyntaxError, message: "Expected \'{expected}\' but found \'{found}\'." },
	[DiagnosticCode.UNTERMINATED_STRING_LITERAL]: { code: 3, kind: DiagnosticKind.SyntaxError, message: "Unterminated string literal." },
	[DiagnosticCode.UNTERMINATED_BLOCK_COMMENT]: { code: 4, kind: DiagnosticKind.SyntaxError, message: "Unterminated block comment." },
	[DiagnosticCode.UNKNOWN_IDENTIFIER]: { code: 5, kind: DiagnosticKind.CompileTimeError, message: "Unknown identifier \'{name}\'." },
	[DiagnosticCode.TYPE_MISMATCH]: { code: 6, kind: DiagnosticKind.CompileTimeError, message: "Type \'{actual}\' is not assignable to type \'{expected}\'." },
	[DiagnosticCode.NAMESPACE_CANNOT_BE_USED_HERE]: { code: 7, kind: DiagnosticKind.CompileTimeError, message: "Namespace cannot be used in this position." },
	[DiagnosticCode.INVALID_COMPILER_OPTION]: { code: 8, kind: DiagnosticKind.ConfigurationError, message: "Invalid compiler option \'{option}\'." },
	[DiagnosticCode.INTERNAL_COMPILER_ERROR]: { code: 9, kind: DiagnosticKind.InternalError, message: "Internal compiler error: {message}." },
	[DiagnosticCode.EXPECTED_TYPE_AFTER_COLON]: { code: 10, kind: DiagnosticKind.SyntaxError, message: "Expected type after \':\'." },
	[DiagnosticCode.EXPECTED_EQUALS_OR_COLON_AFTER_VARIABLE_NAME]: { code: 11, kind: DiagnosticKind.SyntaxError, message: "Expected \'=\' or \':\' after variable name." },
	[DiagnosticCode.EXPECTED_TYPE_AFTER_BAR_IN_UNION]: { code: 12, kind: DiagnosticKind.SyntaxError, message: "Expected type after \'|\' in union type" },
	[DiagnosticCode.EXPECTED_NAME_AFTER_FUNCTION]: { code: 13, kind: DiagnosticKind.SyntaxError, message: "Expected name after \'fn\'" },
	[DiagnosticCode.EXPECTED_NAME_AFTER_ENUM]: { code: 14, kind: DiagnosticKind.SyntaxError, message: "Expected name after \'enum\'" },
	[DiagnosticCode.EXPECTED_VALUE_AFTER_EQUALS]: { code: 15, kind: DiagnosticKind.SyntaxError, message: "Expected value after \'=\'" },
	[DiagnosticCode.EXPECTED_TAG_IN_MODIFIER]: { code: 16, kind: DiagnosticKind.SyntaxError, message: "Expected tag inside of modifier" },
	[DiagnosticCode.MISSING_TOKEN]: { code: 17, kind: DiagnosticKind.SyntaxError, message: "Missing \'{token}\' but found none" },
	[DiagnosticCode.UNSUPPORTED]: { code: 18, kind: DiagnosticKind.CompileTimeError, message: "Unsupported: {message}" },
	[DiagnosticCode.MISSING_LITERAL]: { code: 19, kind: DiagnosticKind.CompileTimeError, message: "Tried calling {function} but could not find literal" },
	[DiagnosticCode.UNTERMINATED_GROUP]: { code: 20, kind: DiagnosticKind.SyntaxError, message: "Expected closing {kind} but found none!" },
	[DiagnosticCode.EXPECTED_EXPRESSION_AFTER_RETURN]: { code: 21, kind: DiagnosticKind.SyntaxError, message: "Expected expression after \'rt\'." },
	[DiagnosticCode.EXPECTED_NAME_AFTER_STRUCT]: { code: 22, kind: DiagnosticKind.SyntaxError, message: "Expected name after \'struct\'" },
	[DiagnosticCode.EXPECTED_EXPRESSION_AFTER_OPERATOR]: { code: 23, kind: DiagnosticKind.SyntaxError, message: "Expected expression after operator \'{operator}\'." },
	[DiagnosticCode.EXPECTED_PARAMETER_LIST]: { code: 24, kind: DiagnosticKind.SyntaxError, message: "Expected \'(\' for paramteters." },
	[DiagnosticCode.MISSING_TOKEN_AT]: { code: 25, kind: DiagnosticKind.SyntaxError, message: "Missing \'{token}\' {message}" }
};
