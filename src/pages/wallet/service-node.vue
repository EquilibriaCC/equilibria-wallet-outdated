<template>
<q-page class="service-node-page">

<!--    <ServiceNodeStaking v-if="screen === 'staking'"/>-->
    <ServiceNodeRegistration  />
<!--    <ServiceNodeUnlock v-if="screen === 'unlock'" />-->
</q-page>
</template>

<script>
// import ServiceNodeStaking from "components/service_node_staking"
import ServiceNodeRegistration from "components/service_node_registration"
// import ServiceNodeUnlock from "components/service_node_unlock"
export default {
    data () {
        return {
            screen: "staking"
        }
    },
    components: {
        // ServiceNodeStaking,
        ServiceNodeRegistration
        // ServiceNodeUnlock
    }
}
</script>

<style lang="scss">
</style>
