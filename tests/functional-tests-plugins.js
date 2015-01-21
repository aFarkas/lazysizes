QUnit.module( "optimumx + respimage", {
	beforeEach: createBeforeEach(
		{
			plugins: ['optimumx']
		}
	)
});


QUnit.module( "optimumx + respimage + respmutation", {
	beforeEach: createBeforeEach(
		{
			plugins: ['optimumx']
		},
		{
			libs: ['respimage', 'respmutation']
		}
	)
});

QUnit.module( "optimumx + rias", {
	beforeEach: createBeforeEach(
		{
			plugins: ['optimumx', 'rias']
		}
	)
});

QUnit.module( "optimumx + rias + respimage", {
	beforeEach: createBeforeEach(
		{
			plugins: ['optimumx', 'rias']
		},
		{
			libs: ['respimage']
		}
	)
});

QUnit.module( "rias", {
	beforeEach: createBeforeEach(
		{
			plugins: ['optimumx', 'rias']
		}
	)
});

QUnit.module( "rias + respimage", {
	beforeEach: createBeforeEach(
		{
			plugins: ['optimumx', 'rias']
		},
		{
			libs: ['respimage']
		}
	)
});
