exports.options = {
	username: Buffer.from([ 49, 50, 51, 52, 53 ]).toString(),
	lm_password: new Buffer([ 93, 195, 184, 77, 210, 74, 210, 225, 52, 56, 223, 24, 28, 173, 46, 60 ]), //httpntlm.ntlm.create_LM_hashed_password('abc123');
	nt_password: new Buffer([ 93, 179, 252, 141, 123, 35, 217, 131, 63, 65, 99, 32, 151, 99, 234, 217 ]), //httpntlm.ntlm.create_NT_hashed_password('abc123');
};


