<template>
    <div class="settings-general">
        <!--    <div class="row justify-between q-mb-md">-->
        <!--        <div><q-radio v-model="config_daemon.type" val="remote" label="Remote Daemon Only" /></div>-->
        <!--        <div><q-radio v-model="config_daemon.type" val="local_remote" label="Local + Remote Daemon" /></div>-->
        <!--        <div><q-radio v-model="config_daemon.type" val="local" label="Local Daemon Only" /></div>-->
        <!--    </div>-->

        <!--    <p v-if="config_daemon.type == 'local_remote'">-->
        <!--        Get started quickly with this default option. Wallet will download the full blockchain, but use a remote node while syncing.-->
        <!--    </p>-->
        <!--    <p v-if="config_daemon.type == 'local'">-->
        <!--        Full security, wallet will download the full blockchain. You will not be able to transact until sync is completed.-->
        <!--    </p>-->
        <!--    <p v-if="is_remote">-->
        <!--        Less security, wallet will connect to a remote node to make all transactions.-->
        <!--    </p>-->

        <template v-if="config_daemon.type != 'remote'">
            <div class="row pl-sm">
                <tritonField class="col-8" label="Local Daemon IP" disable>
                    <q-input
                        v-model="config_daemon.rpc_bind_ip"
                        :placeholder="daemon_defaults.rpc_bind_ip"
                        :dark="theme=='dark'"
                        disable
                        hide-underline
                    />
                </tritonField>
                <tritonField class="col-4" label="Local Daemon Port (RPC)">
                    <q-input
                        v-model="config_daemon.rpc_bind_port"
                        :placeholder="asString(daemon_defaults.rpc_bind_port)"
                        type="number"
                        :decimals="0"
                        :step="1"
                        min="1024"
                        max="65535"
                        :dark="theme=='dark'"
                        hide-underline
                    />
                </tritonField>
            </div>
        </template>

        <template v-if="config_daemon.type != 'local'">
            <div class="row q-mt-md pl-sm">
                <tritonField class="col-8" label="Remote Node Host">
                    <q-input
                        v-model="config_daemon.remote_host"
                        :placeholder="daemon_defaults.remote_host"
                        :dark="theme=='dark'"
                        hide-underline
                    />
                    <!-- Remote node presets -->
                    <q-btn-dropdown class="remote-dropdown" v-if="config.app.net_type === 'mainnet'" flat>
                        <q-list link dark no-border>
                            <q-item v-for="option in remotes" :key="option.host" @click.native="setPreset(option)"
                                    v-close-overlay>
                                <q-item-main>
                                    <q-item-tile label>{{ option.host }}:{{ option.port }}</q-item-tile>
                                </q-item-main>

                            </q-item>
                        </q-list>
                    </q-btn-dropdown>
                </tritonField>
                <tritonField class="col-4" label="Remote Node Port">
                    <q-input
                        v-model="config_daemon.remote_port"
                        :placeholder="asString(daemon_defaults.remote_port)"
                        type="number"
                        :decimals="0"
                        :step="1"
                        min="1024"
                        max="65535"
                        :dark="theme=='dark'"
                        hide-underline
                    />
                </tritonField>
            </div>
            <p style="font-size: 10px; margin-bottom: 0">If the wallet fails to load on startup, please wait 10 seconds
                then try again. If that still does not work, try restarting the wallet.</p>
            <div style="display: grid;grid-template-columns: 1fr 1fr; grid-gap: 15px; width: 20%">
                <div style="margin-top: 20px">
                    <q-btn style="background-color: #db1010; margin-left: auto"
                           class="send-btn"
                           @click="removeRemote()"
                           label="Remove Node"/>
                </div>
                <div style="margin-top: 20px">
                    <q-btn style="background-color: #005BC6; margin-left: auto"
                           class="send-btn"
                           @click="addRemote()"
                           label="Add Node"/>
                </div>
            </div>

        </template>

        <q-field helper="Scan for the fastest remote node" label="Remote Node Scan" orientation="vertical">
            <q-option-group
                type="radio"
                v-model="config.app.scan"
                :options="[
                { label: 'Enabled', value: true },
                { label: 'Disabled', value: false },
                ]"
            />
        </q-field>

        <q-collapsible label="Advanced Options"
                       header-class="q-mt-sm non-selectable row reverse advanced-options-label">
            <div class="row justify-between q-mb-md">
                <div>
                    <q-radio v-model="config_daemon.type" val="remote" label="Remote Daemon Only"/>
                </div>
                <div>
                    <q-radio v-model="config_daemon.type" val="local_remote" label="Local + Remote Daemon"/>
                </div>
                <div>
                    <q-radio v-model="config_daemon.type" val="local" label="Local Daemon Only"/>
                </div>
            </div>

            <p v-if="config_daemon.type == 'local_remote'">
                Get started quickly with this default option. Wallet will download the full blockchain, but use a remote
                node while syncing.
            </p>
            <p v-if="config_daemon.type == 'local'">
                Full security, wallet will download the full blockchain. You will not be able to transact until sync is
                completed.
            </p>
            <p v-if="is_remote">
                Less security, wallet will connect to a remote node to make all transactions.
            </p>
            <div class="col q-mt-md pt-sm">
                <tritonField label="Data Storage Path" disable-hover>
                    <q-input v-model="config.app.data_dir" disable :dark="theme=='dark'" hide-underline/>
                    <input type="file" webkitdirectory directory id="dataPath" v-on:change="setDataPath"
                           ref="fileInputData" hidden/>
                    <q-btn color="secondary" v-on:click="selectPath('data')" :text-color="theme=='dark'?'white':'dark'">
                        Select Location
                    </q-btn>
                </tritonField>
                <tritonField label="Wallet Storage Path" disable-hover>
                    <q-input v-model="config.app.wallet_data_dir" disable :dark="theme=='dark'" hide-underline/>
                    <input type="file" webkitdirectory directory id="walletPath" v-on:change="setWalletDataPath"
                           ref="fileInputWallet" hidden/>
                    <q-btn color="secondary" v-on:click="selectPath('wallet')"
                           :text-color="theme=='dark'?'white':'dark'">Select Location
                    </q-btn>
                </tritonField>
            </div>

            <div class="row pl-sm q-mt-sm">
                <tritonField class="col-6" label="Daemon Log Level" :disable="is_remote">
                    <q-input v-model="config_daemon.log_level" :placeholder="asString(daemon_defaults.log_level)"
                             :disable="is_remote" :dark="theme=='dark'"
                             type="number" :decimals="0" :step="1" min="0" max="4" hide-underline/>
                </tritonField>
                <tritonField class="col-6" label="Wallet Log Level">
                    <q-input v-model="config.wallet.log_level" :placeholder="asString(defaults.wallet.log_level)"
                             :dark="theme=='dark'"
                             type="number" :decimals="0" :step="1" min="0" max="4" hide-underline/>
                </tritonField>
            </div>

            <div class="row pl-sm q-mt-md">
                <tritonField class="col-3" label="Max Incoming Peers" :disable="is_remote">
                    <q-input v-model="config_daemon.in_peers" :placeholder="asString(daemon_defaults.in_peers)"
                             :disable="is_remote" :dark="theme=='dark'"
                             type="number" :decimals="0" :step="1" min="-1" max="65535" hide-underline/>
                </tritonField>
                <tritonField class="col-3" label="Max Outgoing Peers" :disable="is_remote">
                    <q-input v-model="config_daemon.out_peers" :placeholder="asString(daemon_defaults.out_peers)"
                             :disable="is_remote" :dark="theme=='dark'"
                             type="number" :decimals="0" :step="1" min="-1" max="65535" hide-underline/>
                </tritonField>
                <tritonField class="col-3" label="Limit Upload Rate" :disable="is_remote">
                    <q-input v-model="config_daemon.limit_rate_up"
                             :placeholder="asString(daemon_defaults.limit_rate_up)" :disable="is_remote"
                             :dark="theme=='dark'"
                             type="number" suffix="Kb/s" :decimals="0" :step="1" min="-1" max="65535" hide-underline/>
                </tritonField>
                <tritonField class="col-3" label="Limit Download Rate" :disable="is_remote">
                    <q-input v-model="config_daemon.limit_rate_down"
                             :placeholder="asString(daemon_defaults.limit_rate_down)" :disable="is_remote"
                             :dark="theme=='dark'"
                             type="number" suffix="Kb/s" :decimals="0" :step="1" min="-1" max="65535" hide-underline/>
                </tritonField>
            </div>
            <div class="row pl-sm q-mt-md">
                <tritonField class="col-3" label="Daemon P2P Port" :disable="is_remote">
                    <q-input v-model="config_daemon.p2p_bind_port"
                             :placeholder="asString(daemon_defaults.p2p_bind_port)" :disable="is_remote"
                             :dark="theme=='dark'"
                             float- type="number" :decimals="0" :step="1" min="1024" max="65535" hide-underline/>
                </tritonField>
                <tritonField class="col-3" label="Daemon ZMQ Port" :disable="is_remote">
                    <q-input v-model="config_daemon.zmq_rpc_bind_port"
                             :placeholder="asString(daemon_defaults.zmq_rpc_bind_port)" :disable="is_remote"
                             :dark="theme=='dark'"
                             float- type="number" :decimals="0" :step="1" min="1024" max="65535" hide-underline/>
                </tritonField>
                <tritonField class="col-3" label="Internal Wallet Port">
                    <q-input v-model="config.app.ws_bind_port" :placeholder="asString(defaults.app.ws_bind_port)"
                             :dark="theme=='dark'"
                             float- type="number" :decimals="0" :step="1" min="1024" max="65535" hide-underline/>
                </tritonField>
                <tritonField class="col-3" label="Wallet RPC Port" :disable="is_remote">
                    <q-input v-model="config.wallet.rpc_bind_port"
                             :placeholder="asString(defaults.wallet.rpc_bind_port)" :disable="is_remote"
                             :dark="theme=='dark'"
                             float- type="number" :decimals="0" :step="1" min="1024" max="65535" hide-underline/>
                </tritonField>
            </div>
            <q-field helper="Choose a network" label="Network" orientation="vertical">
                <q-option-group
                    type="radio"
                    v-model="config.app.net_type"
                    :options="[
                { label: 'Main Net', value: 'mainnet' },
                { label: 'Stage Net', value: 'stagenet' },
                { label: 'Test Net', value: 'testnet' }
                ]"
                />
            </q-field>

        </q-collapsible>
    </div>
</template>

<script>
import { mapState } from "vuex"
import tritonField from "components/triton_field"

const path = require("upath")
const fs = require("fs")

export default {
    name: "SettingsGeneral",
    props: {
        randomise_remote: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    computed: mapState({
        theme: state => state.gateway.app.config.appearance.theme,
        _remotes: state => state.gateway.app.remotes,
        config: state => state.gateway.app.pending_config,
        config_daemon (state) {
            return this.config.daemons[this.config.app.net_type]
        },
        is_remote (state) {
            return this.config_daemon.type === "remote"
        },
        defaults: state => state.gateway.app.defaults,
        daemon_defaults (state) {
            return this.defaults.daemons[this.config.app.net_type]
        }
    }),
    beforeMount () {
        this.remotes = this._remotes
    },
    mounted () {
        if (this.randomise_remote && this.remotes.length > 0 && this.config.app.net_type === "mainnet") {
            const index = Math.floor(Math.random() * Math.floor(this.remotes.length))
            this.setPreset(this.remotes[index])
        }
    },
    methods: {
        removeRemote () {
            let remotes = JSON.parse(fs.readFileSync(path.join(this.config.app.data_dir, "gui", "remotes.json")))
            let new_remotes = []
            for (const i in remotes) {
                if (remotes[i].host !== this.config_daemon.remote_host) {
                    new_remotes.push(remotes[i])
                }
            }
            this.$gateway.send("core", "change_remotes", new_remotes)
            this.remotes = new_remotes
        },
        addRemote () {
            let remotes = JSON.parse(fs.readFileSync(path.join(this.config.app.data_dir, "gui", "remotes.json")))
            let check = false
            for (const i in remotes) {
                if (remotes[i].host === this.config_daemon.remote_host) {
                    check = true
                }
            }

            if (check) { return }
            remotes.push({ host: this.config_daemon.remote_host, port: this.config_daemon.remote_port })
            this.$gateway.send("core", "change_remotes", remotes)
            this.remotes = remotes
        },
        selectPath (type) {
            const fileInput = type === "data" ? "fileInputData" : "fileInputWallet"
            this.$refs[fileInput].click()
        },
        setDataPath (file) {
            if (file.target.files && file.target.files.length > 0) {
                this.config.app.data_dir = file.target.files[0].path
            }
        },
        setWalletDataPath (file) {
            if (file.target.files && file.target.files.length > 0) {
                this.config.app.wallet_data_dir = file.target.files[0].path
            }
        },
        setPreset (option) {
            if (!option) return

            const { host, port } = option
            if (host) this.config_daemon.remote_host = host
            if (port) this.config_daemon.remote_port = port
        },
        asString (value) {
            if (!value && typeof value !== "number") return ""
            return String(value)
        }
    },
    data () {
        return {
            select: 0,
            remotes: []
        }
    },
    components: {
        tritonField,
        path,
        fs
    }
}
</script>

<style lang="scss">
.settings-general {
    .q-field {
        margin: 20px 0
    }

    .q-if-disabled {
        cursor: default !important;

        .q-input-target {
            cursor: default !important;
        }
    }

    .q-item,
    .q-collapsible-sub-item {
        padding: 0;
    }

    .row.pl-sm {
        > * + * {
            padding-left: 16px;
        }
    }

    .col.pt-sm {
        > * + * {
            padding-top: 16px;
        }
    }

    .remote-dropdown {
        padding: 0 !important;
    }
}
</style>
