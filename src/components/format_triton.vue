<template>
<span>{{ value }}</span>
</template>

<script>
export default {
    name: "Formattriton",
    props: {
        amount: {
            required: true
        },
        round: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    computed: {
        value () {
            let value = this.amount / 1e4
            if (this.round) { value = value.toFixed(2) }
            return value.toLocaleString()
        }

    }
}
</script>

<style>
</style>
