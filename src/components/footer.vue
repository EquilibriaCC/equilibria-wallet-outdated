<template>
<q-layout-footer class="status-footer">
    <div class="status-line row items-center">
        <div class="status row items-center">
            <span>Status:</span>
            <span class="status-text" :class="[status]">{{ status | upperCase }}</span>
        </div>
        <div class="row">
            <template v-if="config_daemon.type !== 'remote'">
                <div>Daemon: {{ daemon.info.height_without_bootstrap }} / {{ target_height }} ({{ daemon_local_pct }}%)</div>
            </template>

            <template v-if="config_daemon.type !== 'local'">
                <div>Remote: {{ daemon.info.height }}</div>
            </template>

            <div>Wallet: {{ wallet.info.height }} / {{ target_height }} ({{ wallet_pct }}%)</div>
        </div>

    </div>
    <div class="status-bars" :class="[status]">
        <div v-bind:style="{ width: daemon_pct+'%' }"></div>
        <div v-bind:style="{ width: wallet_pct+'%' }"></div>
    </div>
</q-layout-footer>
</template>

<script>
import { mapState } from "vuex"
export default {
    name: "StatusFooter",
    computed: mapState({

        config: state => state.gateway.app.config,
        daemon: state => state.gateway.daemon,
        wallet: state => state.gateway.wallet,

        config_daemon (state) {
            return this.config.daemons[this.config.app.net_type]
        },
        target_height (state) {
            if (this.config_daemon.type === "local") { return Math.max(this.daemon.info.height, this.daemon.info.target_height) } else { return this.daemon.info.height }
        },
        daemon_pct (state) {
            if (this.config_daemon.type === "local") { return this.daemon_local_pct }
            return 0
        },
        daemon_local_pct (state) {
            if (this.config_daemon.type === "remote") { return 0 }
            let pct = (100 * this.daemon.info.height_without_bootstrap / this.target_height).toFixed(1)
            if (pct === 100.0 && this.daemon.info.height_without_bootstrap < this.target_height) { return 99.9 } else { return pct }
        },
        wallet_pct (state) {
            let pct = (100 * this.wallet.info.height / this.target_height).toFixed(1)
            if (pct === 100.0 && this.wallet.info.height < this.target_height) { return 99.9 } else { return pct }
        },
        status (state) {
            if (this.config_daemon.type === "local") {
                if (this.daemon.info.height_without_bootstrap < this.target_height) {
                    return "syncing"
                } else if (this.wallet.info.height < this.target_height - 1 && this.wallet.info.height !== 0) {
                    return "scanning"
                } else {
                    return "ready"
                }
            } else {
                if (this.wallet.info.height < this.target_height - 1 && this.wallet.info.height !== 0) {
                    return "scanning"
                } else if (this.config_daemon.type === "local_remote" && this.daemon.info.height_without_bootstrap < this.target_height) {
                    return "syncing"
                } else {
                    return "ready"
                }
            }
        }

    }),
    filters: {
        upperCase: function (status) {
            return status.toUpperCase()
        }
    },
    data () {
        return {
        }
    }
}
</script>

<style lang="scss">
</style>
