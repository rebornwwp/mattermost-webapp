// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {UserProfile} from 'mattermost-redux/types/users';
import {ClientConfig, ClientLicense} from 'mattermost-redux/types/config';
import {PreferenceType} from 'mattermost-redux/types/preferences';
import {Role} from 'mattermost-redux/types/roles';
import {Team} from 'mattermost-redux/types/teams';

const myDataQueryString = `
{
    config
    license
    user(id: "me") {
      id
      create_at: createAt
      delete_at: deleteAt
      username
      auth_service: authService
      email
      nickname
      first_name: firstName
      last_name: lastName
      position
      roles {
        id
        name
        permissions
      }
      props
      notify_props: notifyProps
      last_picture_update: lastPictureUpdateAt
      locale
      timezone
      is_bot: isBot
      preferences {
        name
        user_id: userId
        category
        value
      }
    }
    teamMembers(userId: "me") {
      team {
        id
        display_name: displayName
        name
        update_at: updateAt
        description
        email
        type
        company_name: companyName
        allowed_domains: allowedDomains
        invite_id: inviteId
        last_team_icon_update: lastTeamIconUpdate
        group_constrained: groupConstrained
        allow_open_invite: allowOpenInvite
      }
      user {
        id
      }
      roles {
        name
      }
      delete_at: deleteAt
      scheme_guest: schemeGuest
      scheme_user: schemeUser
      scheme_admin: schemeAdmin
    }
}
`;

export const myDataQuery = JSON.stringify({query: myDataQueryString});

export type MyDataQueryResponseType = {
    data: {
        user: UserProfile & {
            roles: Role[];
            preferences: PreferenceType[];
        };
        config: ClientConfig;
        license: ClientLicense;
        teamMembers: Array<{
            team: Team;
            user: UserProfile;
            roles: Role[];
            delete_at: number;
            scheme_guest: boolean;
            scheme_user: boolean;
            scheme_admin: boolean;
        }>;
    };
};

export function convertRolesArrayToString(roles: Role[]): string {
    return roles.map((role) => role.name!).join(',') ?? '';
}

export function transformToRecievedMeReducerPayload(user: Partial<MyDataQueryResponseType['data']['user']>) {
    return {
        ...user,
        position: user?.position ?? '',
        roles: convertRolesArrayToString(user?.roles ?? []),

        // below fields arent included in the response but not inside of user rest api types
        auth_data: '',
        email_verified: true,
        allow_marketing: true,
        last_activity_at: 0,
        bot_description: '',
        bot_last_icon_update: 0,
        terms_of_service_id: '',
        terms_of_service_create_at: 0,
        remote_id: '',
    };
}

export function transformToRecievedMyTeamMembersReducerPayload(teamsMembers: Partial<MyDataQueryResponseType['data']['teamMembers']>) {
    return teamsMembers.map((teamMember) => ({
        team_id: teamMember?.team?.id ?? '',
        user_id: teamMember?.user?.id ?? '',
        delete_at: teamMember?.delete_at ?? 0,
        roles: convertRolesArrayToString(teamMember?.roles ?? []),
        scheme_admin: teamMember?.scheme_admin ?? false,
        scheme_guest: teamMember?.scheme_guest ?? false,
        scheme_user: teamMember?.scheme_user ?? false,

        // below fields arent included in the response but where inside of TeamMembership api types
        mention_count: 0,
        mention_count_root: 0,
        msg_count: 0,
        msg_count_root: 0,
        thread_count: 0,
        thread_mention_count: 0,
    }));
}
