# Generated by Django 5.1.4 on 2025-01-06 22:00

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orm', '0004_user_is_active_user_user_last_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='seller',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='seller_orders', to='orm.user'),
            preserve_default=False,
        ),
    ]
