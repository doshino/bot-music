const { Message } = require('discord.js')
const Command = require('../../structures/Command')

module.exports = class extends Command {
    constructor(client){
        super(client, {
            name: 'play',
            description: 'Faz com que o bot toque uma musica no canal que você está.',
            options: [
                {
                    name: 'musica',
                    type: 'STRING',
                    description: 'Musica que você deseja que o bot toque.',
                    required: true
                }
            ]
        })
    }

    run = async(interaction) => {
        if(!interaction.member.voice.channel) return interaction.reply({ content: 'Você precisa estar em um canal de voz para utilizar esse comando!', ephemeral: true })
        if(interaction.guild.me.voice.channel && interaction.guild.me.voice.channel.id != interaction.member.voice.channel.id) return interaction.reply({ content: 'Você precisa estar no mesmo canal de voz que eu para utilizar este comando!', ephemeral: true })
        
        const search = interaction.options.getString('musica')

        let res;

        try {
            res = await this.client.manager.search(search, interaction.user)

            if(res.loadType === "LOAD_FAILED") throw res.exception
            else if(res.loadType === "PLAYLIST_LOADED") throw { message: "Playlist não sao suportadas neste comando." }
        } catch (err) {
            return interaction.reply({ content: `Aconteceu um erro ao tentar buscar a musica: ${err.message}`, ephemeral: true})
        }

        if (!res?.tracks?.[0]) return interaction.reply({ content: `Música não encontrada!`, ephemeral: true })

        const player = this.client.manager.create({
            guild: interaction.guild.id,
            voiceChannel: interaction.member.voice.channel.id,
            textChannel: interaction.channel.id
        })

        if (player.state !== 'CONNECTED') player.connect()
        player.queue.add(res.tracks[0])

        if (!player.playing && !player.paused) player.play()

        return interaction.reply({ content: `\`${res.tracks[0].title}\` adicionada à fila.` })
    }
}