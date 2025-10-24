<script>
    export let value;
    export let group;
    export let label = "sdfgsdfgsdfg";
    export let id = "testid";
</script>

<input type="radio" {id} class="peer hidden" name={group} {value} />

<label
    for={id}
    class="peer-checked:border-blue-500 peer-checked:bg-blue-100
           border border-gray-300 rounded-lg px-4 py-2 cursor-pointer
           transition-colors duration-150 block text-center"
>
    {label}
</label>
